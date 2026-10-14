import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { MissionStatusUpdate } from '../missionRunner';

export type MissionServiceStatus = Omit<MissionStatusUpdate, 'state'> & {
	state: MissionStatusUpdate['state'] | 'Stopping' | 'Stopped';
	updatedAt: string;
	active?: boolean;
};

const RENAME_RETRY_CODES = new Set(['EPERM', 'EACCES', 'EBUSY']);
const RENAME_RETRY_BUDGET_MS = 2000;

// On Windows, replacing a file that another process holds open (the dashboard
// polling status, antivirus scanning the new file) fails transiently with
// EPERM/EACCES/EBUSY. Retry with backoff, as graceful-fs does.
async function renameWithRetry(from: string, to: string): Promise<void> {
	const deadline = Date.now() + RENAME_RETRY_BUDGET_MS;
	for (let attempt = 1; ; attempt += 1) {
		try {
			await fs.rename(from, to);
			return;
		} catch (error) {
			const code = (error as NodeJS.ErrnoException).code;
			if (!code || !RENAME_RETRY_CODES.has(code) || Date.now() >= deadline) throw error;
			await new Promise((resolve) => setTimeout(resolve, Math.min(attempt * 10, 100)));
		}
	}
}

// Readers must see either the previous snapshot or the complete next snapshot.
export async function persistMissionStatus(filePath: string, status: MissionServiceStatus): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
	try {
		await fs.writeFile(temporaryPath, JSON.stringify(status, null, 2), 'utf8');
		await renameWithRetry(temporaryPath, filePath);
	} finally {
		await fs.rm(temporaryPath, { force: true });
	}
}
