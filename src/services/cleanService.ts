// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { createDiscordCleanupOptions, runDiscordDmCleanup } from '../clearDm';

export type CleanServiceStatus = {
	state: 'inactive' | 'running' | 'completed' | 'error' | 'stopped';
	targetUserId?: string;
	message: string;
	updatedAt: string;
};

const controllers = new Map<string, AbortController>();
const statuses = new Map<string, CleanServiceStatus>();

export class CleanService {
	getStatus(userId: string): CleanServiceStatus {
		return (
			statuses.get(userId) ?? {
				state: 'inactive',
				message: 'No cleanup started from the web dashboard.',
				updatedAt: new Date().toISOString(),
			}
		);
	}

	async start(
		userId: string,
		token: string,
		options: { targetUserId?: string } = {},
	): Promise<CleanServiceStatus> {
		if (controllers.has(userId)) {
			throw new Error('Cleanup is already active for this user.');
		}

		const controller = new AbortController();
		controllers.set(userId, controller);
		this.setStatus(userId, {
			state: 'running',
			targetUserId: options.targetUserId,
			message: 'Cleanup started from web dashboard.',
		});

		void runDiscordDmCleanup({
			...createDiscordCleanupOptions(token),
			targetUserId: options.targetUserId,
			signal: controller.signal,
		})
			.then(() => {
				this.setStatus(userId, {
					state: 'completed',
					targetUserId: options.targetUserId,
					message: 'Cleanup completed.',
				});
			})
			.catch((error: unknown) => {
				this.setStatus(userId, {
					state: controller.signal.aborted ? 'stopped' : 'error',
					targetUserId: options.targetUserId,
					message: error instanceof Error ? error.message : String(error),
				});
			})
			.finally(() => {
				controllers.delete(userId);
			});

		return this.getStatus(userId);
	}

	stop(userId: string): CleanServiceStatus {
		const controller = controllers.get(userId);
		if (!controller) {
			this.setStatus(userId, {
				state: 'inactive',
				message: 'No active cleanup to stop.',
			});
			return this.getStatus(userId);
		}

		controller.abort('Cleanup stopped from web dashboard.');
		controllers.delete(userId);
		this.setStatus(userId, {
			state: 'stopped',
			message: 'Cleanup stopped from web dashboard.',
		});
		return this.getStatus(userId);
	}

	private setStatus(
		userId: string,
		update: Omit<CleanServiceStatus, 'updatedAt'>,
	): void {
		statuses.set(userId, {
			...this.getStatus(userId),
			...update,
			updatedAt: new Date().toISOString(),
		});
	}
}

export const cleanService = new CleanService();
