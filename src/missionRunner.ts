// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { ClientQuest } from './client';
import { QuestTaskConfigType } from './interface';
import { Quest } from './quest';

export type MissionState = 'Waiting' | 'Running' | 'Completed' | 'Error';

export type MissionStatusUpdate = {
	state: MissionState;
	currentMission?: string;
	gameName?: string;
	applicationId?: string;
	gameIconUrl?: string;
	largeImage?: string;
	reward?: string;
	currentIndex?: number;
	totalMissions?: number;
	queuePosition?: number;
	progress?: number;
	detail?: string;
};

export type MissionStatusReporter = (
	update: MissionStatusUpdate,
	force?: boolean,
) => void | Promise<void>;

export type AvailableMission = {
	id: string;
	name: string;
	gameName: string;
	applicationId?: string;
	gameIconUrl?: string;
	largeImage?: string;
	reward: string;
	taskType?: QuestTaskConfigType;
	duration: number;
	progress: number;
	available: boolean;
	unavailableReason?: string;
	enrolled: boolean;
};

export type RunMissionFlowOptions = {
	missionId?: string;
	stallTimeoutMs?: number;
};

// Desktop tasks report once per minute; allow three intervals without progress.
const DEFAULT_STALL_TIMEOUT_MS = 3 * 60 * 1000;

type MissionDetails = {
	name: string;
	gameName: string;
	applicationId?: string;
	gameIconUrl?: string;
	largeImage?: string;
	duration: number;
	reward: string;
};

type ApplicationDetails = {
	id: string;
	name: string;
	icon?: string | null;
};

type MissionBatch = {
	manager: Awaited<ReturnType<ClientQuest['fetchQuests']>>;
	quests: Quest[];
	applications: Map<string, ApplicationDetails>;
};

const TASK_PRIORITY = [
	QuestTaskConfigType.WATCH_VIDEO,
	QuestTaskConfigType.WATCH_VIDEO_ON_MOBILE,
	QuestTaskConfigType.PLAY_ON_DESKTOP,
	QuestTaskConfigType.STREAM_ON_DESKTOP,
	QuestTaskConfigType.PLAY_ACTIVITY,
] as const;

const AUTO_RUN_TASKS = new Set<QuestTaskConfigType>([
	QuestTaskConfigType.WATCH_VIDEO,
	QuestTaskConfigType.WATCH_VIDEO_ON_MOBILE,
	QuestTaskConfigType.PLAY_ON_DESKTOP,
]);

function applicationIconUrl(application?: ApplicationDetails): string | undefined {
	if (!application?.id || !application.icon) return undefined;
	const extension = application.icon.startsWith('a_') ? 'gif' : 'png';
	return `https://cdn.discordapp.com/app-icons/${application.id}/${application.icon}.${extension}?size=256`;
}

function getQuestData(
	quest: Quest,
	application?: ApplicationDetails,
): MissionDetails {
	const questId = quest.id || quest.config?.id || 'unknown';
	const name =
		quest.config?.messages?.quest_name?.trim() ||
		quest.config?.messages?.game_title?.trim() ||
		questId;
	const gameName =
		quest.config?.messages?.game_title?.trim() ||
		quest.config?.application?.name?.trim() ||
		name;
	const applicationId = quest.config?.application?.id;
	const gameIconUrl = applicationIconUrl(application);
	const largeImage =
		gameIconUrl ||
		quest.config?.assets?.game_tile ||
		quest.config?.assets?.logotype ||
		quest.config?.assets?.hero;
	const tasks =
		quest.config?.task_config?.tasks ?? quest.config?.task_config_v2?.tasks;
	const firstTask = tasks ? Object.values(tasks)[0] : undefined;
	const duration = firstTask?.target ?? 0;
	const rewardConfig = quest.config?.rewards_config?.rewards?.[0];
	const reward =
		rewardConfig?.messages?.name ??
		(rewardConfig?.orb_quantity
			? `${rewardConfig.orb_quantity} Orbs`
			: 'Unknown reward');

	return {
		name,
		gameName,
		applicationId,
		gameIconUrl,
		largeImage,
		duration,
		reward,
	};
}

function getQuestTask(quest: Quest): {
	taskType?: QuestTaskConfigType;
	duration: number;
	secondsDone: number;
} {
	const tasks =
		quest.config?.task_config?.tasks ?? quest.config?.task_config_v2?.tasks;
	for (const taskType of TASK_PRIORITY) {
		const task = tasks?.[taskType];
		if (!task) continue;

		return {
			taskType,
			duration: task.target ?? 0,
			secondsDone: quest.userStatus?.progress?.[taskType]?.value ?? 0,
		};
	}

	return {
		duration: 0,
		secondsDone: 0,
	};
}

function unavailableReason(taskType?: QuestTaskConfigType): string | undefined {
	if (!taskType) return 'Tipo de missao nao identificado pelo Discord.';
	if (AUTO_RUN_TASKS.has(taskType)) return undefined;
	if (taskType === QuestTaskConfigType.STREAM_ON_DESKTOP) {
		return 'Transmitir no desktop nao funciona mais via Node.';
	}
	if (taskType === QuestTaskConfigType.PLAY_ACTIVITY) {
		return 'Jogar atividade precisa ser concluido pelo app Discord.';
	}
	return 'Tipo de missao nao suportado pelo runner.';
}

function toProgress(secondsDone?: number, secondsNeeded?: number): number {
	if (!secondsNeeded || secondsNeeded <= 0) return 0;
	return Math.min(
		100,
		Math.max(0, Math.round(((secondsDone ?? 0) / secondsNeeded) * 100)),
	);
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function isAbortError(error: unknown, signal?: AbortSignal): boolean {
	return Boolean(signal?.aborted) || error === signal?.reason;
}

async function fetchAvailableMissions(
	questClient: ClientQuest,
	ignoredQuestIds: Set<string>,
): Promise<MissionBatch> {
	const manager = await questClient.fetchQuests();
	const quests = manager
		.filterQuestsValid()
		.filter((quest) => !ignoredQuestIds.has(quest.id));
	const applicationIds = [
		...new Set(
			quests
				.map((quest) => quest.config?.application?.id)
				.filter((id): id is string => Boolean(id)),
		),
	];
	const applications = new Map<string, ApplicationDetails>();
	if (applicationIds.length > 0) {
		try {
			const response = await manager.getApplicationData(applicationIds);
			response.forEach((application) => {
				applications.set(application.id, application);
			});
		} catch (error) {
			console.error('Could not fetch quest application metadata:', error);
		}
	}

	return {
		manager,
		quests,
		applications,
	};
}

export async function listAvailableMissions(
	token: string,
): Promise<AvailableMission[]> {
	const questClient = new ClientQuest(token);
	const { quests, applications } = await fetchAvailableMissions(
		questClient,
		new Set(),
	);

	return quests.map((quest) => {
		const details = getQuestData(
			quest,
			quest.config?.application?.id
				? applications.get(quest.config.application.id)
				: undefined,
		);
		const task = getQuestTask(quest);
		const reason = unavailableReason(task.taskType);

		return {
			id: quest.id,
			...details,
			taskType: task.taskType,
			duration: task.duration,
			progress: toProgress(task.secondsDone, task.duration),
			available: !reason,
			unavailableReason: reason,
			enrolled: quest.isEnrolledQuest(),
		};
	});
}

export async function runMissionFlow(
	token: string,
	reportStatus: MissionStatusReporter,
	signal?: AbortSignal,
	options: RunMissionFlowOptions = {},
): Promise<void> {
	signal?.throwIfAborted();
	await reportStatus({
		state: 'Waiting',
		detail: 'Buscando missoes disponiveis.',
	});

	const questClient = new ClientQuest(token);
	let completed = 0;
	let failed = 0;
	const attemptedQuestIds = new Set<string>();
	const targetMissionId = options.missionId?.trim();
	const stallTimeoutMs = options.stallTimeoutMs ?? DEFAULT_STALL_TIMEOUT_MS;
	if (!Number.isFinite(stallTimeoutMs) || stallTimeoutMs <= 0) {
		throw new Error('Tempo limite de progresso invalido.');
	}

	while (true) {
		signal?.throwIfAborted();
		await reportStatus({
			state: 'Waiting',
			progress: completed > 0 || failed > 0 ? 100 : 0,
			detail:
				completed > 0 || failed > 0
					? 'Buscando outra missao disponivel.'
					: 'Buscando missoes disponiveis.',
		});

		const { manager, quests, applications } = await fetchAvailableMissions(
			questClient,
			attemptedQuestIds,
		);
		signal?.throwIfAborted();

		const runnableQuests = quests.filter((candidate) => !unavailableReason(getQuestTask(candidate).taskType));
		const selectedQuest = targetMissionId
			? quests.find((candidate) => candidate.id === targetMissionId)
			: runnableQuests[0];

		if (!selectedQuest) {
			const totalHandled = completed + failed;
			await reportStatus(
				{
					state: targetMissionId || failed > 0 ? 'Error' : 'Completed',
					progress: targetMissionId ? 0 : 100,
					totalMissions: totalHandled,
					detail:
						targetMissionId
							? 'A missao selecionada nao esta disponivel para este usuario.'
							: totalHandled === 0
							? 'Nenhuma missao valida foi encontrada.'
							: failed > 0
								? `Finalizado com ${completed} concluidas e ${failed} com erro.`
								: `Todas as ${completed} missoes foram concluidas.`,
				},
				true,
			);
			return;
		}

		const quest = selectedQuest;
		attemptedQuestIds.add(quest.id);
		const details = getQuestData(
			quest,
			quest.config?.application?.id
				? applications.get(quest.config.application.id)
				: undefined,
		);
		const currentIndex = completed + failed + 1;
		const totalMissions = targetMissionId ? 1 : completed + failed + runnableQuests.length;

		await reportStatus({
			state: 'Running',
			currentMission: details.name,
			gameName: details.gameName,
			applicationId: details.applicationId,
			gameIconUrl: details.gameIconUrl,
			largeImage: details.largeImage,
			reward: details.reward,
			currentIndex,
			totalMissions,
			progress: 0,
			detail: `Recompensa: ${details.reward}`,
		});

		const missionController = new AbortController();
		const abortMission = () => missionController.abort(signal?.reason);
		signal?.addEventListener('abort', abortMission, { once: true });
		if (signal?.aborted) abortMission();
		let highestProgress = getQuestTask(quest).secondsDone;
		const onStall = () => missionController.abort(new Error(targetMissionId
			? 'Missao sem avancar por tempo demais. Tente novamente mais tarde.'
			: 'Missao sem avancar por tempo demais. A fila seguira para a proxima.'));
		let stallTimer = setTimeout(onStall, stallTimeoutMs);
		let progressReports = Promise.resolve();
		try {
			const reason = unavailableReason(getQuestTask(quest).taskType);
			if (reason) throw new Error(reason);
			await manager.doingQuest(quest, (update) => {
				if (missionController.signal.aborted) return;
				if (typeof update.secondsDone === 'number' && update.secondsDone > highestProgress) {
					highestProgress = update.secondsDone;
					clearTimeout(stallTimer);
					stallTimer = setTimeout(onStall, stallTimeoutMs);
				}
				progressReports = progressReports.then(() => reportStatus({
					state: 'Running',
					currentMission: details.name,
					gameName: details.gameName,
					applicationId: details.applicationId,
					gameIconUrl: details.gameIconUrl,
					largeImage: details.largeImage,
					reward: details.reward,
					currentIndex,
					totalMissions,
					progress: toProgress(update.secondsDone, update.secondsNeeded),
					detail: update.message,
				}));
				// Observe failures immediately; the queue below still propagates them.
				void progressReports.catch(() => undefined);
			}, missionController.signal);
			clearTimeout(stallTimer);
			missionController.signal.throwIfAborted();
			await progressReports;
			signal?.throwIfAborted();
			completed++;
			await reportStatus(
				{
					state: targetMissionId ? 'Completed' : 'Running',
					currentMission: details.name,
					gameName: details.gameName,
					applicationId: details.applicationId,
					gameIconUrl: details.gameIconUrl,
					largeImage: details.largeImage,
					reward: details.reward,
					currentIndex,
					totalMissions,
					progress: 100,
					detail: targetMissionId
						? 'Missao selecionada concluida.'
						: 'Missao concluida. Buscando outra missao disponivel.',
				},
				true,
			);
			if (targetMissionId) return;
		} catch (error) {
			await progressReports;
			if (isAbortError(error, signal)) {
				throw error;
			}

			failed++;
			await reportStatus(
				{
					state: targetMissionId ? 'Error' : 'Running',
					currentMission: details.name,
					gameName: details.gameName,
					applicationId: details.applicationId,
					gameIconUrl: details.gameIconUrl,
					largeImage: details.largeImage,
					reward: details.reward,
					currentIndex,
					totalMissions,
					progress: toProgress(0, details.duration),
					detail: errorMessage(error),
				},
				true,
			);
			if (targetMissionId) return;
		} finally {
			clearTimeout(stallTimer);
			signal?.removeEventListener('abort', abortMission);
		}
	}
}
