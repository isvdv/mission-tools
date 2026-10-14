const fs = require('node:fs/promises');
const path = require('node:path');
const userId = process.argv[2];
const directory = process.env.MISSION_TOOLS_DATA_DIR;
const statusPath = path.join(directory, 'mission-status', `${userId}.json`);
const cancelPath = path.join(directory, 'mission-cancel', `${userId}.json`);

async function writeStatus(payload) {
  const temporaryPath = `${statusPath}.fixture.tmp`;
  await fs.writeFile(temporaryPath, JSON.stringify(payload));
  await fs.rename(temporaryPath, statusPath);
}

async function main() {
  const payload = { state: 'Running', progress: 35, updatedAt: new Date().toISOString() };
  await writeStatus(payload);
  process.send?.({ type: 'status', payload });
  while (true) {
    try { await fs.access(cancelPath); break; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  await new Promise((resolve) => setTimeout(resolve, 50));
  await writeStatus({ ...payload, state: 'Stopped' });
  process.disconnect?.();
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
