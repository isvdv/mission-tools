import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { MissionStatusUpdate } from '../missionRunner';

export type MissionServiceStatus = Omit<MissionStatusUpdate, 'state'> & {
	state: MissionStatusUpdate['state'] | 'Stopping' | 'Stopped';
	updatedAt: string;
	active?: boolean;
};

// Readers must see either the previous snapshot or the complete next snapshot.
export async function persistMissionStatus(filePath: string, status: MissionServiceStatus): Promise<void> {
	await fs.mkdir(path.dirname(filePath), { recursive: true });
	const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
	try {
		await fs.writeFile(temporaryPath, JSON.stringify(status, null, 2), 'utf8');
		await fs.rename(temporaryPath, filePath);
	} finally {
		await fs.rm(temporaryPath, { force: true });
	}
}
