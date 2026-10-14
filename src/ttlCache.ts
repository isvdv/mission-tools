// Credito: Perfil Discord https://discord.com/users/1411202571804348507
import { createHash } from 'node:crypto';

type Entry<T> = {
	value?: T;
	expiresAt: number;
	pending?: Promise<T>;
};

const MAX_ENTRIES = 500;

/**
 * Short-lived memo for remote calls: concurrent callers share one in-flight
 * request and successful results are reused until they expire. Failures are
 * never cached.
 */
export class TtlCache<T> {
	private readonly entries = new Map<string, Entry<T>>();

	constructor(private readonly ttlMs: number) {}

	async get(key: string, load: () => Promise<T>): Promise<T> {
		const now = Date.now();
		const entry = this.entries.get(key);
		if (entry?.pending) return entry.pending;
		if (entry && 'value' in entry && entry.expiresAt > now) return entry.value as T;

		const pending = load();
		this.entries.set(key, { expiresAt: 0, pending });
		try {
			const value = await pending;
			this.prune(now);
			this.entries.set(key, { value, expiresAt: Date.now() + this.ttlMs });
			return value;
		} catch (error) {
			if (this.entries.get(key)?.pending === pending) this.entries.delete(key);
			throw error;
		}
	}

	delete(key: string): void {
		this.entries.delete(key);
	}

	private prune(now: number): void {
		if (this.entries.size < MAX_ENTRIES) return;
		for (const [key, entry] of this.entries) {
			if (!entry.pending && entry.expiresAt <= now) this.entries.delete(key);
		}
	}
}

/** Stable cache key for a credential without keeping the raw value as a key. */
export function secretKey(secret: string): string {
	return createHash('sha256').update(secret).digest('base64url');
}
