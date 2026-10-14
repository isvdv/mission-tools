// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { MissionStatusUpdate, runMissionFlow } from '../missionRunner';
import { DiscordRichPresenceSession } from '../richPresence';
import { persistMissionStatus, type MissionServiceStatus } from './missionStatusStore';

const userId = process.argv[2];
const token = process.env.MISSION_TOOLS_WORKER_TOKEN;
const targetMissionId = process.env.MISSION_TOOLS_TARGET_MISSION_ID?.trim() || undefined;

const DATA_DIR = path.resolve(process.env.MISSION_TOOLS_DATA_DIR ?? path.join(process.cwd(), 'data'));
const CANCEL_DIR = path.join(DATA_DIR, 'mission-cancel');
const STATUS_DIR = path.join(DATA_DIR, 'mission-status');
const LOG_DIR = path.join(DATA_DIR, 'mission-worker-logs');

function cancelFilePath(): string {
	return path.join(CANCEL_DIR, `${userId}.json`);
}

function statusFilePath(): string {
	return path.join(STATUS_DIR, `${userId}.json`);
}

function logFilePath(): string {
	return path.join(LOG_DIR, `${userId || 'unknown'}.log`);
}

async function log(message: string): Promise<void> {
	await fs.mkdir(LOG_DIR, { recursive: true });
	await fs.appendFile(
		logFilePath(),
		`[${new Date().toISOString()}] ${message}\n`,
		'utf8',
	);
}

function missionActivity(update: MissionStatusUpdate) {
	const gameName =
		update.gameName?.trim() ||
		update.currentMission?.trim() ||
		'Mission Tools';

	return {
		activityType: 0 as const,
		applicationId: update.applicationId,
		name: gameName,
		largeImage: update.gameIconUrl || update.largeImage,
		largeText: gameName,
		startTimestamp: new Date().toISOString(),
	};
}

async function cancelRequested(): Promise<boolean> {
	try {
		await fs.access(cancelFilePath());
		return true;
	} catch {
		return false;
	}
}

let statusWrites: Promise<void> = Promise.resolve();

function writeStatus(update: Omit<MissionServiceStatus, 'updatedAt'>): Promise<void> {
	statusWrites = statusWrites.then(() => writeStatusSnapshot(update));
	return statusWrites;
}

async function writeStatusSnapshot(update: Omit<MissionServiceStatus, 'updatedAt'>): Promise<void> {
	if (!userId) return;
	const payload = {
		...update,
		updatedAt: new Date().toISOString(),
	};
	await persistMissionStatus(statusFilePath(), payload);

	if (typeof process.send === 'function') {
		process.send({ type: 'status', payload });
	}
}

async function main(): Promise<void> {
	await log('Worker carregado.');
	if (!userId || !token) {
		throw new Error('Mission worker requires user id and token.');
	}

	const controller = new AbortController();
	let presence: DiscordRichPresenceSession | null = null;
	let lastApplicationId: string | undefined;
	let lastMission: string | undefined;
	const abortFromSignal = () => {
		if (!controller.signal.aborted) {
			controller.abort('Missao parada pelo painel web.');
		}
	};
	process.once('SIGTERM', abortFromSignal);
	process.once('SIGINT', abortFromSignal);

	const cancelWatcher = setInterval(() => {
		void cancelRequested().then((requested) => {
			if (requested && !controller.signal.aborted) {
				controller.abort('Missao parada pelo painel web.');
			}
		});
	}, 500);

	try {
		await log('Iniciando runMissionFlow.');
		await runMissionFlow(
			token,
			async (update) => {
				await writeStatus(update);
				if (update.state === 'Running') {
					if (!presence || lastApplicationId !== update.applicationId || lastMission !== update.currentMission) {
						presence?.stop();
						lastApplicationId = update.applicationId;
						lastMission = update.currentMission;
						presence = new DiscordRichPresenceSession(
							token,
							() => undefined,
							update.applicationId || process.env.RICH_PRESENCE_APPLICATION_ID,
						);
						presence.start(missionActivity(update));
						return;
					}
				}
			},
			controller.signal,
			{ missionId: targetMissionId },
		);
	} catch (error) {
		await log(
			`Erro capturado: ${
				error instanceof Error ? error.stack ?? error.message : String(error)
			}`,
		);
		if (controller.signal.aborted) {
			await writeStatus({
				state: 'Stopped',
				progress: 0,
				detail: 'Missao parada pelo painel web.',
			});
			return;
		}

		await writeStatus({
			state: 'Error',
			progress: 0,
			detail: error instanceof Error ? error.message : String(error),
		});
		process.exitCode = 1;
	} finally {
		clearInterval(cancelWatcher);
		process.off('SIGTERM', abortFromSignal);
		process.off('SIGINT', abortFromSignal);
		const activePresence = presence as DiscordRichPresenceSession | null;
		activePresence?.stop();
		await log(`Worker finalizando com exitCode ${process.exitCode ?? 0}.`);
		try {
			await fs.rm(cancelFilePath(), { force: true });
		} catch {
			// Best-effort cleanup.
		}
	}
}

main()
	.catch(async (error: unknown) => {
		await log(
			`Erro fatal: ${
				error instanceof Error ? error.stack ?? error.message : String(error)
			}`,
		);
		await writeStatus({
			state: 'Error',
			progress: 0,
			detail: error instanceof Error ? error.message : String(error),
		});
		process.exitCode = 1;
	})
	.finally(() => {
		if (typeof process.disconnect === 'function' && process.connected) {
			process.disconnect();
		}
		setTimeout(() => {
			process.exit(process.exitCode ?? 0);
		}, 50).unref();
	});
