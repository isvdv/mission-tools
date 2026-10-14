import assert from 'node:assert/strict';
import { test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { ClientQuest } from '../src/client';
import { Quest } from '../src/quest';
import { QuestManager } from '../src/questManager';
import { QuestTaskConfigType, type Quest as QuestShape } from '../src/interface';
import { runMissionFlow, type MissionStatusUpdate } from '../src/missionRunner';

function quest(id: string, task = QuestTaskConfigType.WATCH_VIDEO) {
	return Quest.create({
		id,
		config: {
			id, expires_at: '2099-01-01',
			messages: { quest_name: `Mission ${id}` },
			task_config: { tasks: { [task]: { target: 60 } } },
		},
		user_status: null,
	} as QuestShape);
}

test('a stale catalog cannot repeat a mission; unsupported tasks are skipped', async (t) => {
	const quests = [quest('1'), quest('2', QuestTaskConfigType.PLAY_ACTIVITY), quest('3')];
	const manager = new QuestManager({} as ClientQuest, quests);
	t.mock.method(ClientQuest.prototype, 'fetchQuests', async () => manager);
	const attempted: string[] = [];
	t.mock.method(manager, 'doingQuest', async (item: Quest) => { attempted.push(item.id); });
	const updates: MissionStatusUpdate[] = [];
	await runMissionFlow('test-token', (update) => { updates.push(update); });
	assert.deepEqual(attempted, ['1', '3']);
	assert.equal(updates.at(-1)?.state, 'Completed');
	assert.equal(updates.filter((update) => update.state === 'Completed').length, 1);
});

test('a stalled mission is cancelled once and the next mission runs', async (t) => {
	const manager = new QuestManager({} as ClientQuest, [quest('1'), quest('2')]);
	t.mock.method(ClientQuest.prototype, 'fetchQuests', async () => manager);
	const attempted: string[] = [];
	t.mock.method(manager, 'doingQuest', async (item: Quest, _report: unknown, signal: AbortSignal) => {
		attempted.push(item.id);
		if (item.id === '1') {
			await new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
		}
	});
	const updates: MissionStatusUpdate[] = [];
	await runMissionFlow('test-token', (update) => { updates.push(update); }, undefined, { stallTimeoutMs: 25 });
	assert.deepEqual(attempted, ['1', '2']);
	assert.match(updates.at(-1)?.detail ?? '', /1 concluidas e 1 com erro/);
	assert.equal(updates.at(-1)?.state, 'Error');
});

test('delayed progress cannot overwrite completion or the next mission', async (t) => {
	const manager = new QuestManager({} as ClientQuest, [quest('1')]);
	t.mock.method(ClientQuest.prototype, 'fetchQuests', async () => manager);
	t.mock.method(manager, 'doingQuest', async (_item: Quest, report: (update: { secondsDone: number; secondsNeeded: number; message: string }) => void) => {
		report({ secondsDone: 30, secondsNeeded: 60, message: 'half' });
		report({ secondsDone: 60, secondsNeeded: 60, message: 'done' });
	});
	const updates: MissionStatusUpdate[] = [];
	await runMissionFlow('test-token', async (update) => {
		if (update.progress === 50) await delay(30);
		updates.push(update);
	}, undefined, { missionId: '1' });
	await delay(40);
	assert.equal(updates.at(-1)?.state, 'Completed');
	assert.equal(updates.at(-1)?.progress, 100);
});

test('manual cancellation stops the whole queue instead of starting another mission', async (t) => {
	const controller = new AbortController();
	const manager = new QuestManager({} as ClientQuest, [quest('1'), quest('2')]);
	t.mock.method(ClientQuest.prototype, 'fetchQuests', async () => manager);
	const attempted: string[] = [];
	t.mock.method(manager, 'doingQuest', async (item: Quest) => {
		attempted.push(item.id);
		controller.abort(new Error('Stopped by test'));
		throw controller.signal.reason;
	});
	await assert.rejects(runMissionFlow('test-token', () => undefined, controller.signal), /Stopped by test/);
	assert.deepEqual(attempted, ['1']);
});
