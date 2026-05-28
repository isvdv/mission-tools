export type MissionJob = {
	userId: string;
	run: (signal: AbortSignal) => Promise<void>;
	onQueued: (position: number) => void | Promise<void>;
	onRejected: (reason: string) => void | Promise<void>;
	onCancelled?: (reason: string) => void | Promise<void>;
	onFailed?: (reason: string) => void | Promise<void>;
	controller?: AbortController;
};

export class MissionQueue {
	private queue: MissionJob[] = [];
	private running: MissionJob | null = null;

	enqueue(job: MissionJob): boolean {
		if (this.hasJobForUser(job.userId)) {
			void job.onRejected(
				'Voce ja tem uma operacao na fila ou em andamento.',
			);
			return false;
		}

		this.queue.push(job);
		this.runCallback(job.onQueued, this.running ? this.queue.length : 1);
		this.scheduleDrain();
		return true;
	}

	cancelUser(userId: string, reason: string): boolean {
		if (this.running?.userId === userId) {
			this.running.controller?.abort(reason);
			if (this.running.onCancelled) {
				this.runCallback(this.running.onCancelled, reason);
			}
			return true;
		}

		const queuedIndex = this.queue.findIndex((job) => job.userId === userId);
		if (queuedIndex === -1) return false;

		const [job] = this.queue.splice(queuedIndex, 1);
		if (job.onCancelled) {
			this.runCallback(job.onCancelled, reason);
		}
		return true;
	}

	private hasJobForUser(userId: string): boolean {
		return (
			this.running?.userId === userId ||
			this.queue.some((job) => job.userId === userId)
		);
	}

	private async drain(): Promise<void> {
		if (this.running) return;

		const job = this.queue.shift();
		if (!job) return;

		this.running = job;
		job.controller = new AbortController();
		try {
			await job.run(job.controller.signal);
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			await (job.onFailed ?? job.onRejected)(reason);
		} finally {
			this.running = null;
			this.scheduleDrain();
		}
	}

	private scheduleDrain(): void {
		void this.drain().catch((error: unknown) => {
			console.error('Mission queue drain failed:', error);
		});
	}

	private runCallback<T>(
		callback: (value: T) => void | Promise<void>,
		value: T,
	): void {
		void Promise.resolve(callback(value)).catch((error: unknown) => {
			console.error('Mission queue callback failed:', error);
		});
	}
}
