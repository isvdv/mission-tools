import assert from 'node:assert/strict';
import { test } from 'node:test';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

test('concurrent starts, cancellation and catalog failures preserve the runtime', async (t) => {
	const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'mission-service-test-'));
	process.env.MISSION_TOOLS_DATA_DIR = directory;
	process.env.MISSION_TOOLS_WORKER_PATH = path.resolve('tests/fixtures/missionWorker.cjs');
	const { missionService } = await import('../src/services/missionService');
	t.after(async () => {
		await missionService.stop('test-user');
		await waitUntil(async () => !(await missionService.getStatus('test-user')).active);
		await fs.rm(directory, { recursive: true, force: true });
	});
	const starts = await Promise.allSettled([
		missionService.start('test-user', 'fake-token'),
		missionService.start('test-user', 'fake-token'),
	]);
	assert.equal(starts.filter((result) => result.status === 'fulfilled').length, 1);
	await waitUntil(async () => (await missionService.getStatus('test-user')).state === 'Running');
	t.mock.method(missionService, 'listAvailable', async () => { throw new Error('API unavailable'); });
	const snapshot = await missionService.getSnapshot('test-user', 'fake-token');
	assert.equal(snapshot.status.active, true);
	assert.equal(snapshot.availableMissions, null);
	assert.ok(snapshot.availableMissionsError);
	const stopping = await missionService.stop('test-user');
	assert.equal(stopping.state, 'Stopping');
	assert.equal(stopping.active, true);
	await assert.rejects(missionService.start('test-user', 'fake-token'), /Ja existe/);
	await waitUntil(async () => !(await missionService.getStatus('test-user')).active);
	assert.equal((await missionService.getStatus('test-user')).state, 'Stopped');
	assert.equal((await missionService.stop('test-user')).state, 'Stopped');
	await missionService.start('test-user', 'fake-token');
	assert.equal((await missionService.getStatus('test-user')).active, true);
});

async function waitUntil(condition: () => Promise<boolean>) {
	const deadline = Date.now() + 5000;
	while (!(await condition())) {
		if (Date.now() > deadline) throw new Error('Timed out waiting for worker');
		await delay(10);
	}
}
