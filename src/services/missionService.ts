// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { ChildProcess, spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { AvailableMission, listAvailableMissions } from '../missionRunner';
import { persistMissionStatus, type MissionServiceStatus } from './missionStatusStore';
import { TtlCache, secretKey } from '../ttlCache';
export type { MissionServiceStatus } from './missionStatusStore';

type MissionWorkerMessage = {
	type: 'status';
	payload: MissionServiceStatus;
};

type MissionRuntime = {
	child: ChildProcess;
	startedAt: string;
	stopping?: boolean;
};

type StartMissionOptions = {
	missionId?: string;
};

type MissionGlobalState = {
	statuses: Map<string, MissionServiceStatus>;
	runtimes: Map<string, MissionRuntime>;
	operations: Map<string, Promise<void>>;
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
		operations: new Map<string, Promise<void>>(),
	});

state.operations ??= new Map();

async function withUserLock<T>(userId: string, operation: () => Promise<T>): Promise<T> {
	const previous = state.operations.get(userId) ?? Promise.resolve();
	let release!: () => void;
	const current = new Promise<void>((resolve) => { release = resolve; });
	state.operations.set(userId, current);
	await previous;
	try {
		return await operation();
	} finally {
		release();
		if (state.operations.get(userId) === current) state.operations.delete(userId);
	}
}

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

// Several open tabs poll the catalog; reuse one Discord fetch for a short while.
const catalogCache = new TtlCache<AvailableMission[]>(10_000);

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
	await fs.rm(cancelFilePath(userId), { force: true });
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
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw error;
	}
}

async function writeStatusFile(
	userId: string,
	status: MissionServiceStatus,
): Promise<void> {
	await persistMissionStatus(statusFilePath(userId), status);
}

function defaultStatus(): MissionServiceStatus {
	return {
		state: 'Waiting',
		progress: 0,
		detail: 'Nenhuma execucao de missao iniciada pelo painel web.',
		updatedAt: new Date().toISOString(),
		active: false,
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
	return Boolean(runtime?.child.pid && runtime.child.exitCode === null && runtime.child.signalCode === null && !runtime.child.killed);
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
		const current = fileStatus ?? state.statuses.get(userId) ?? defaultStatus();
		const runtime = state.runtimes.get(userId);
		if (runtime?.stopping) return { ...current, state: 'Stopping', active: true, detail: 'Parando a missao. Aguarde o processo encerrar.' };
		if (!runtime && fileStatus && ['Running', 'Waiting', 'Stopping'].includes(current.state)) {
			return { ...current, state: 'Error', active: false, detail: 'A execucao anterior foi interrompida. Inicie novamente para continuar.' };
		}
		return { ...current, active: Boolean(runtime) };
	}

	async listAvailable(token: string): Promise<AvailableMission[]> {
		return listAvailableMissions(token);
	}

	async getSnapshot(userId: string, token: string, includeMissions = true): Promise<{
		status: MissionServiceStatus;
		availableMissions?: AvailableMission[] | null;
		availableMissionsError?: string | null;
	}> {
		const [status, catalog] = await Promise.all([
			this.getStatus(userId),
			includeMissions
				? catalogCache.get(secretKey(token), () => this.listAvailable(token)).then(
					(availableMissions) => ({ availableMissions, availableMissionsError: null }),
					() => ({ availableMissions: null, availableMissionsError: 'Nao foi possivel atualizar a lista no Discord. Tente novamente.' }),
				)
				: Promise.resolve({}),
		]);
		return { status, ...catalog };
	}

	async start(userId: string, token: string, options: StartMissionOptions = {}): Promise<MissionServiceStatus> {
		return withUserLock(userId, () => this.startLocked(userId, token, options));
	}

	private async startLocked(userId: string, token: string, options: StartMissionOptions): Promise<MissionServiceStatus> {
		const existing = state.runtimes.get(userId);
		if (existing) {
			throw new Error('Ja existe uma missao em execucao para este usuario.');
		}
		catalogCache.delete(secretKey(token));

		await clearCancelRequest(userId);
		const initialStatus: MissionServiceStatus = {
			state: 'Waiting',
			progress: 0,
			detail: 'Missao iniciada em processo separado.',
			updatedAt: new Date().toISOString(),
			active: true,
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
				MISSION_TOOLS_TARGET_MISSION_ID: options.missionId ?? '',
				MISSION_TOOLS_DATA_DIR: DATA_DIR,
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
			void fs.appendFile(
				logFilePath(userId),
				`[${new Date().toISOString()}] Spawn error: ${error.stack ?? error.message}\n`,
			);
		});

		child.on('close', (code, signal) => {
			void withUserLock(userId, async () => {
			const runtime = state.runtimes.get(userId);
			if (runtime?.child !== child) return;

			void fs.appendFile(
				logFilePath(userId),
				`[${new Date().toISOString()}] Worker saiu com codigo ${code ?? 'n/a'}${signal ? ` (${signal})` : ''}.\n`,
			);

			try {
				const fileStatus = await readStatusFile(userId);
				const memoryStatus = state.statuses.get(userId);
				const current = memoryStatus?.state === 'Error' ? memoryStatus : fileStatus ?? memoryStatus;
				if (runtime.stopping || !current || current.state === 'Running' || current.state === 'Waiting') {
					const status: MissionServiceStatus = {
						...(current ?? defaultStatus()),
						state: runtime.stopping ? 'Stopped' : 'Error',
						active: false,
						detail:
							runtime.stopping
								? 'Missao parada pelo painel web.'
								: `Processo da missao saiu com codigo ${code ?? 'n/a'}${signal ? ` (${signal})` : ''}.`,
						updatedAt: new Date().toISOString(),
					};
					state.statuses.set(userId, status);
					await writeStatusFile(userId, status);
				} else if (current) {
					await writeStatusFile(userId, { ...current, active: false });
				}
			} finally {
				state.runtimes.delete(userId);
			}
			}).catch((error: unknown) => console.error('Falha ao finalizar status da missao:', error));
		});

		await new Promise<void>((resolve, reject) => {
			child.once('spawn', resolve);
			child.once('error', reject);
		});
		return initialStatus;
	}

	async stop(userId: string): Promise<MissionServiceStatus> {
		return withUserLock(userId, () => this.stopLocked(userId));
	}

	private async stopLocked(userId: string): Promise<MissionServiceStatus> {
		const runtime = state.runtimes.get(userId);
		if (!runtime || runtime.stopping) return this.getStatus(userId);
		const reason = 'Missao parada pelo painel web.';
		await requestCancel(userId, reason);
		runtime.stopping = true;
		if (runtime && isRunning(runtime)) {
			setTimeout(() => {
				if (isRunning(runtime)) {
					forceKill(runtime);
				}
			}, 2500).unref();
		}

		const status: MissionServiceStatus = {
			...(state.statuses.get(userId) ?? (await readStatusFile(userId)) ?? defaultStatus()),
			state: 'Stopping',
			active: true,
			detail: 'Parando a missao. Aguarde o processo encerrar.',
			updatedAt: new Date().toISOString(),
		};
		state.statuses.set(userId, status);
		return status;
	}
}

export const missionService = new MissionService();
