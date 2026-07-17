// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export type MissionToolsLogLevel = 'info' | 'success' | 'error';

export type MissionToolsLogEntry = {
	id: string;
	userId: string;
	module: string;
	action: string;
	result: MissionToolsLogLevel;
	message: string;
	error?: string;
	createdAt: string;
};

type LogStoreFile = {
	version: 1;
	entries: MissionToolsLogEntry[];
};

const DEFAULT_LOG_PATH = path.join('data', 'web-logs.json');
const STORE_VERSION = 1;
const MAX_LOG_ENTRIES = 500;

export class LogService {
	private readonly filePath: string;
	private operationQueue: Promise<void> = Promise.resolve();

	constructor(filePath = process.env.WEB_LOG_STORE_PATH ?? DEFAULT_LOG_PATH) {
		this.filePath = path.resolve(process.cwd(), filePath);
	}

	async list(limit = 100): Promise<MissionToolsLogEntry[]> {
		const store = await this.read();
		return store.entries.slice(-Math.max(1, limit)).reverse();
	}

	async write(
		entry: Omit<MissionToolsLogEntry, 'id' | 'createdAt'>,
	): Promise<MissionToolsLogEntry> {
		return this.withLock(async () => {
			const store = await this.read();
			const next: MissionToolsLogEntry = {
				...entry,
				id: randomUUID(),
				createdAt: new Date().toISOString(),
			};
			store.entries.push(next);
			store.entries = store.entries.slice(-MAX_LOG_ENTRIES);
			await this.persist(store);
			return next;
		});
	}

	private async read(): Promise<LogStoreFile> {
		try {
			const raw = await fs.readFile(this.filePath, 'utf8');
			const parsed = JSON.parse(raw) as LogStoreFile;
			if (parsed.version !== STORE_VERSION || !Array.isArray(parsed.entries)) {
				return this.emptyStore();
			}
			return parsed;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				return this.emptyStore();
			}
			if (error instanceof SyntaxError) {
				return this.emptyStore();
			}
			throw error;
		}
	}

	private async persist(store: LogStoreFile): Promise<void> {
		await fs.mkdir(path.dirname(this.filePath), { recursive: true });
		await fs.writeFile(this.filePath, JSON.stringify(store, null, 2), 'utf8');
	}

	private emptyStore(): LogStoreFile {
		return {
			version: STORE_VERSION,
			entries: [],
		};
	}

	private async withLock<T>(operation: () => Promise<T>): Promise<T> {
		const previous = this.operationQueue;
		let release!: () => void;
		this.operationQueue = new Promise<void>((resolve) => {
			release = resolve;
		});

		await previous;
		try {
			return await operation();
		} finally {
			release();
		}
	}
}

export const logService = new LogService();
