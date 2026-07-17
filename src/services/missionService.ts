// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { ChildProcess, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { MissionStatusUpdate } from '../missionRunner';

export type MissionServiceStatus = MissionStatusUpdate & {
	updatedAt: string;
};

type MissionWorkerMessage = {
	type: 'status';
	payload: MissionServiceStatus;
};

type MissionRuntime = {
	child: ChildProcess;
	startedAt: string;
};

type MissionGlobalState = {
	statuses: Map<string, MissionServiceStatus>;
	runtimes: Map<string, MissionRuntime>;
};

const globalKey = '__missionToolsMissionServiceState';
const globalState = globalThis as typeof globalThis & {
	[globalKey]?: MissionGlobalState;
};

const state =
	globalState[globalKey] ??
	(globalState[globalKey] = {
		statuses: new Map<string, MissionServiceStatus>(),
		runtimes: new Map<string, MissionRuntime>(),
	});

function resolveProjectRoot(): string {
	const configuredRoot = process.env.MISSION_TOOLS_PROJECT_ROOT;
	if (configuredRoot) {
		return path.resolve(configuredRoot);
	}

	let current = process.cwd();

	for (let index = 0; index < 6; index += 1) {
		if (
			existsSync(path.join(current, 'src', 'services', 'missionWorker.ts')) &&
			existsSync(path.join(current, 'node_modules', 'tsx', 'dist', 'cli.mjs'))
		) {
			return current;
		}

		const parent = path.dirname(current);
		if (parent === current) break;
		current = parent;
	}

	return path.resolve(process.cwd(), '..');
}

const PROJECT_ROOT = resolveProjectRoot();
const DATA_DIR = path.resolve(process.env.MISSION_TOOLS_DATA_DIR ?? path.join(PROJECT_ROOT, 'data'));
const CANCEL_DIR = path.join(DATA_DIR, 'mission-cancel');
const STATUS_DIR = path.join(DATA_DIR, 'mission-status');
const LOG_DIR = path.join(DATA_DIR, 'mission-worker-logs');

function cancelFilePath(userId: string): string {
	return path.join(CANCEL_DIR, `${userId}.json`);
}

function statusFilePath(userId: string): string {
	return path.join(STATUS_DIR, `${userId}.json`);
}

function logFilePath(userId: string): string {
	return path.join(LOG_DIR, `${userId}.log`);
}

async function clearCancelRequest(userId: string): Promise<void> {
	try {
		await fs.rm(cancelFilePath(userId), { force: true });
	} catch {
		// Best-effort cleanup.
	}
}

async function requestCancel(userId: string, reason: string): Promise<void> {
	await fs.mkdir(CANCEL_DIR, { recursive: true });
	await fs.writeFile(
		cancelFilePath(userId),
		JSON.stringify(
			{
				reason,
				createdAt: new Date().toISOString(),
			},
			null,
			2,
		),
		'utf8',
	);
}

async function readStatusFile(userId: string): Promise<MissionServiceStatus | null> {
	try {
		const raw = await fs.readFile(statusFilePath(userId), 'utf8');
		return JSON.parse(raw) as MissionServiceStatus;
	} catch {
		return null;
	}
}

async function writeStatusFile(
	userId: string,
	status: MissionServiceStatus,
): Promise<void> {
	await fs.mkdir(STATUS_DIR, { recursive: true });
	await fs.writeFile(statusFilePath(userId), JSON.stringify(status, null, 2), 'utf8');
}

function defaultStatus(): MissionServiceStatus {
	return {
		state: 'Waiting',
		progress: 0,
		detail: 'Nenhuma execucao de missao iniciada pelo painel web.',
		updatedAt: new Date().toISOString(),
	};
}

function tsxCliPath(): string {
	return path.join(PROJECT_ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
}

function workerPath(): string {
	return process.env.MISSION_TOOLS_WORKER_PATH ?? path.join(PROJECT_ROOT, 'src', 'services', 'missionWorker.ts');
}

function workerArgs(userId: string): string[] {
	if (process.env.MISSION_TOOLS_WORKER_PATH) {
		return [workerPath(), userId];
	}

	return [tsxCliPath(), workerPath(), userId];
}

function isRunning(runtime?: MissionRuntime): boolean {
	return Boolean(runtime?.child.pid && runtime.child.exitCode === null && !runtime.child.killed);
}

function forceKill(runtime: MissionRuntime): void {
	const pid = runtime.child.pid;
	if (!pid) return;

	if (process.platform === 'win32') {
		spawn('taskkill', ['/pid', String(pid), '/T', '/F'], {
			stdio: 'ignore',
			windowsHide: true,
		});
		return;
	}

	runtime.child.kill('SIGKILL');
}

export class MissionService {
	async getStatus(userId: string): Promise<MissionServiceStatus> {
		const fileStatus = await readStatusFile(userId);
		if (fileStatus) {
			state.statuses.set(userId, fileStatus);
			return fileStatus;
		}

		return state.statuses.get(userId) ?? defaultStatus();
	}

	async start(userId: string, token: string): Promise<MissionServiceStatus> {
		const existing = state.runtimes.get(userId);
		if (isRunning(existing)) {
			throw new Error('Ja existe uma missao em execucao para este usuario.');
		}

		await clearCancelRequest(userId);
		const initialStatus: MissionServiceStatus = {
			state: 'Waiting',
			progress: 0,
			detail: 'Missao iniciada em processo separado.',
			updatedAt: new Date().toISOString(),
		};
		state.statuses.set(userId, initialStatus);
		await writeStatusFile(userId, initialStatus);
		await fs.mkdir(LOG_DIR, { recursive: true });
		await fs.writeFile(
			logFilePath(userId),
			`[${new Date().toISOString()}] Iniciando worker da missao.\n`,
			'utf8',
		);

		const child = spawn(process.execPath, workerArgs(userId), {
			cwd: PROJECT_ROOT,
			env: {
				...process.env,
				MISSION_TOOLS_WORKER_TOKEN: token,
			},
			stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
			windowsHide: true,
		});

		state.runtimes.set(userId, {
			child,
			startedAt: new Date().toISOString(),
		});

		child.on('message', (message: MissionWorkerMessage) => {
			if (message?.type !== 'status') return;
			state.statuses.set(userId, message.payload);
		});

		child.stdout?.on('data', (chunk: Buffer) => {
			void fs.appendFile(logFilePath(userId), chunk);
		});

		child.stderr?.on('data', (chunk: Buffer) => {
			void fs.appendFile(logFilePath(userId), chunk);
		});

		child.on('error', (error) => {
			const status: MissionServiceStatus = {
				...defaultStatus(),
				state: 'Error',
				progress: 0,
				detail: `Falha ao iniciar processo da missao: ${error.message}`,
				updatedAt: new Date().toISOString(),
			};
			state.statuses.set(userId, status);
			void writeStatusFile(userId, status);
			void fs.appendFile(
				logFilePath(userId),
				`[${new Date().toISOString()}] Spawn error: ${error.stack ?? error.message}\n`,
			);
		});

		child.on('exit', (code, signal) => {
			const runtime = state.runtimes.get(userId);
			if (runtime?.child === child) {
				state.runtimes.delete(userId);
			}

			void fs.appendFile(
				logFilePath(userId),
				`[${new Date().toISOString()}] Worker saiu com codigo ${code ?? 'n/a'}${signal ? ` (${signal})` : ''}.\n`,
			);

			void readStatusFile(userId).then((fileStatus) => {
				const current = fileStatus ?? state.statuses.get(userId);
				if (current?.state === 'Error') {
					state.statuses.set(userId, current);
					return;
				}

				if (!current || current.state === 'Running' || current.state === 'Waiting') {
					const status: MissionServiceStatus = {
						...(current ?? defaultStatus()),
						state: code === 0 ? 'Completed' : 'Error',
						detail:
							code === 0
								? 'Processo da missao finalizado.'
								: `Processo da missao saiu com codigo ${code ?? 'n/a'}${signal ? ` (${signal})` : ''}.`,
						updatedAt: new Date().toISOString(),
					};
					state.statuses.set(userId, status);
					void writeStatusFile(userId, status);
				}
			});
		});

		return initialStatus;
	}

	async stop(userId: string): Promise<MissionServiceStatus> {
		const reason = 'Missao parada pelo painel web.';
		await requestCancel(userId, reason);

		const runtime = state.runtimes.get(userId);
		if (runtime && isRunning(runtime)) {
			setTimeout(() => {
				if (isRunning(runtime)) {
					forceKill(runtime);
				}
			}, 2500).unref();
		}

		const status: MissionServiceStatus = {
			...(state.statuses.get(userId) ?? (await readStatusFile(userId)) ?? defaultStatus()),
			state: 'Completed',
			progress: 0,
			detail: 'Stop enviado. O processo da missao recebeu exit.',
			updatedAt: new Date().toISOString(),
		};
		state.statuses.set(userId, status);
		await writeStatusFile(userId, status);

		return status;
	}
}

export const missionService = new MissionService();
