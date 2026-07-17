// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { DiscordVoiceSession, VoiceSessionUpdate } from '../discord';

type VoiceRuntime = {
	token: string;
	session: DiscordVoiceSession;
};

export type VoiceServiceStatus = VoiceSessionUpdate & {
	guildId?: string;
	channelId?: string;
	updatedAt: string;
};

const sessions = new Map<string, VoiceRuntime>();
const statuses = new Map<string, VoiceServiceStatus>();

export class VoiceService {
	getStatus(userId: string): VoiceServiceStatus {
		return (
			statuses.get(userId) ?? {
				status: 'disconnected',
				updatedAt: new Date().toISOString(),
			}
		);
	}

	start(
		userId: string,
		token: string,
		guildId: string,
		channelId: string,
	): VoiceServiceStatus {
		if (!guildId || !channelId) {
			throw new Error('Guild ID and voice channel ID are required.');
		}

		const session = this.getSession(userId, token);
		session.start(guildId, channelId);
		this.setStatus(userId, {
			status: 'reconnecting',
			guildId,
			channelId,
		});
		return this.getStatus(userId);
	}

	stop(userId: string): VoiceServiceStatus {
		sessions.get(userId)?.session.stop();
		sessions.delete(userId);
		this.setStatus(userId, {
			status: 'disconnected',
			connectedAt: undefined,
		});
		return this.getStatus(userId);
	}

	private getSession(userId: string, token: string): DiscordVoiceSession {
		const existing = sessions.get(userId);
		if (existing?.token === token) return existing.session;

		existing?.session.stop();
		const session = new DiscordVoiceSession(token, (update) => {
			this.setStatus(userId, update);
		});
		sessions.set(userId, { token, session });
		return session;
	}

	private setStatus(
		userId: string,
		update: Partial<VoiceServiceStatus> & Pick<VoiceServiceStatus, 'status'>,
	): void {
		statuses.set(userId, {
			...this.getStatus(userId),
			...update,
			updatedAt: new Date().toISOString(),
		});
	}
}

export const voiceService = new VoiceService();
