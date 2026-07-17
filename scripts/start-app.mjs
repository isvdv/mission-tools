import { spawn } from 'node:child_process';
import process from 'node:process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const runners = [
  { name: 'bot', args: ['start'] },
  { name: 'painel web', args: ['run', 'web:dev'] }
];

let isStopping = false;
const children = [];

function stopAll(signal = 'SIGTERM') {
  isStopping = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

for (const runner of runners) {
  console.log(`[app] Iniciando ${runner.name}...`);
  const child = spawn(npmCommand, runner.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit'
  });

  child.on('exit', (code, signal) => {
    if (isStopping) {
      return;
    }

    console.log(`[app] ${runner.name} encerrou${signal ? ` com sinal ${signal}` : ` com codigo ${code ?? 0}`}.`);
    stopAll();
    process.exit(code ?? 1);
  });

  children.push(child);
}

console.log('[app] Painel: http://localhost:3000');
console.log('[app] Pressione Ctrl+C para encerrar bot e painel.');

process.on('SIGINT', () => {
  stopAll('SIGINT');
});

process.on('SIGTERM', () => {
  stopAll('SIGTERM');
});
