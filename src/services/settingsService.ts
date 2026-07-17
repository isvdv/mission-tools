// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { promises as fs } from 'node:fs';
import path from 'node:path';

export type WebSettings = {
	defaultGuildId?: string;
	defaultVoiceChannelId?: string;
	webhookUrl?: string;
	enabledModules: Record<string, boolean>;
	updatedAt: string;
};

type SettingsStoreFile = {
	version: 1;
	users: Record<string, WebSettings>;
};

const DEFAULT_SETTINGS_PATH = path.join('data', 'web-settings.json');

export class SettingsService {
	private readonly filePath: string;
	private operationQueue: Promise<void> = Promise.resolve();

	constructor(filePath = process.env.WEB_SETTINGS_STORE_PATH ?? DEFAULT_SETTINGS_PATH) {
		this.filePath = path.resolve(process.cwd(), filePath);
	}

	async get(userId: string): Promise<WebSettings> {
		const store = await this.read();
		return store.users[userId] ?? this.defaultSettings();
	}

	async update(userId: string, patch: Partial<WebSettings>): Promise<WebSettings> {
		return this.withLock(async () => {
			const store = await this.read();
			const current = store.users[userId] ?? this.defaultSettings();
			const next: WebSettings = {
				...current,
				...patch,
				enabledModules: {
					...current.enabledModules,
					...(patch.enabledModules ?? {}),
				},
				updatedAt: new Date().toISOString(),
			};
			store.users[userId] = next;
			await this.write(store);
			return next;
		});
	}

	private defaultSettings(): WebSettings {
		return {
			enabledModules: {
				mission: true,
				clean: true,
				voice: true,
				presence: true,
				username: true,
				deleteDm: true,
			},
			updatedAt: new Date().toISOString(),
		};
	}

	private async read(): Promise<SettingsStoreFile> {
		try {
			const raw = await fs.readFile(this.filePath, 'utf8');
			const parsed = JSON.parse(raw) as SettingsStoreFile;
			return {
				version: 1,
				users: parsed.users ?? {},
			};
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
				return { version: 1, users: {} };
			}
			throw error;
		}
	}

	private async write(store: SettingsStoreFile): Promise<void> {
		await fs.mkdir(path.dirname(this.filePath), { recursive: true });
		await fs.writeFile(this.filePath, JSON.stringify(store, null, 2), 'utf8');
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

export const settingsService = new SettingsService();
