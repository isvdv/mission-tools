// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import {
	DiscordRichPresenceSession,
	RichPresenceRuntimeConfig,
} from '../richPresence';

type PresenceRuntime = {
	token: string;
	session: DiscordRichPresenceSession;
};

export type PresenceServiceStatus = {
	status: 'active' | 'inactive';
	config: RichPresenceRuntimeConfig;
	updatedAt: string;
};

const sessions = new Map<string, PresenceRuntime>();
const statuses = new Map<string, PresenceServiceStatus>();

export class PresenceService {
	getStatus(userId: string): PresenceServiceStatus {
		return (
			statuses.get(userId) ?? {
				status: 'inactive',
				config: {},
				updatedAt: new Date().toISOString(),
			}
		);
	}

	update(
		userId: string,
		token: string,
		config: RichPresenceRuntimeConfig,
	): PresenceServiceStatus {
		const session = this.getSession(userId, token, config.applicationId);
		session.update(config);
		this.setStatus(userId, {
			status: 'active',
			config,
		});
		return this.getStatus(userId);
	}

	stop(userId: string): PresenceServiceStatus {
		sessions.get(userId)?.session.stop();
		sessions.delete(userId);
		this.setStatus(userId, {
			status: 'inactive',
			config: this.getStatus(userId).config,
		});
		return this.getStatus(userId);
	}

	private getSession(
		userId: string,
		token: string,
		applicationId?: string,
	): DiscordRichPresenceSession {
		const existing = sessions.get(userId);
		if (existing?.token === token) return existing.session;

		existing?.session.stop();
		const session = new DiscordRichPresenceSession(
			token,
			(status) => {
				this.setStatus(userId, {
					status,
					config: this.getStatus(userId).config,
				});
			},
			applicationId || process.env.RICH_PRESENCE_APPLICATION_ID,
		);
		sessions.set(userId, { token, session });
		return session;
	}

	private setStatus(
		userId: string,
		update: Omit<PresenceServiceStatus, 'updatedAt'>,
	): void {
		statuses.set(userId, {
			...update,
			updatedAt: new Date().toISOString(),
		});
	}
}

export const presenceService = new PresenceService();
