import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const standaloneRoot = path.join(rootDir, 'web', '.next', 'standalone');
const standaloneWebDir = standaloneRoot;
const serverPath = path.join(standaloneWebDir, 'server.js');
const staticSource = path.join(rootDir, 'web', '.next', 'static');
const staticTarget = path.join(standaloneWebDir, '.next', 'static');
const publicSource = path.join(rootDir, 'web', 'public');
const publicTarget = path.join(standaloneWebDir, 'public');

if (!existsSync(serverPath)) {
  throw new Error(`Next standalone build nao encontrado: ${serverPath}`);
}

await mkdir(path.dirname(staticTarget), { recursive: true });
await rm(staticTarget, { recursive: true, force: true });
await cp(staticSource, staticTarget, { recursive: true });

if (existsSync(publicSource)) {
  await rm(publicTarget, { recursive: true, force: true });
  await cp(publicSource, publicTarget, { recursive: true });
}

console.log('Desktop assets preparados.');
