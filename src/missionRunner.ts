// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { ClientQuest } from './client';
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

export async function runMissionFlow(
	token: string,
	reportStatus: MissionStatusReporter,
	signal?: AbortSignal,
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

		if (quests.length === 0) {
			const totalHandled = completed + failed;
			await reportStatus(
				{
					state: failed > 0 ? 'Error' : 'Completed',
					progress: 100,
					totalMissions: totalHandled,
					detail:
						totalHandled === 0
							? 'Nenhuma missao valida foi encontrada.'
							: failed > 0
								? `Finalizado com ${completed} concluidas e ${failed} com erro.`
								: `Todas as ${completed} missoes foram concluidas.`,
				},
				true,
			);
			return;
		}

		const quest = quests[0];
		attemptedQuestIds.add(quest.id);
		const details = getQuestData(
			quest,
			quest.config?.application?.id
				? applications.get(quest.config.application.id)
				: undefined,
		);
		const currentIndex = completed + failed + 1;
		const totalMissions = completed + failed + quests.length;

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

		try {
			await manager.doingQuest(quest, (update) => {
				if (signal?.aborted) return;
				void reportStatus({
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
				});
			}, signal);
			signal?.throwIfAborted();
			completed++;
			await reportStatus(
				{
					state: 'Completed',
					currentMission: details.name,
					gameName: details.gameName,
					applicationId: details.applicationId,
					gameIconUrl: details.gameIconUrl,
					largeImage: details.largeImage,
					reward: details.reward,
					currentIndex,
					totalMissions,
					progress: 100,
					detail: `Missao concluida. Buscando outra missao disponivel.`,
				},
				true,
			);
		} catch (error) {
			if (isAbortError(error, signal)) {
				throw error;
			}

			failed++;
			await reportStatus(
				{
					state: 'Error',
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
		}
	}
}
