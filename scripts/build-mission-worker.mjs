import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const outputDir = path.join(rootDir, 'desktop');

await mkdir(outputDir, { recursive: true });

await build({
  entryPoints: [path.join(rootDir, 'src', 'services', 'missionWorker.ts')],
  outfile: path.join(outputDir, 'mission-worker.cjs'),
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  sourcemap: false,
  logLevel: 'info'
});
