const { app, BrowserWindow, dialog, shell } = require('electron');
const { spawn } = require('node:child_process');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const path = require('node:path');

let mainWindow = null;
let serverProcess = null;
let logFilePath = null;

function writeLog(message) {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  if (!logFilePath) {
    console.log(line.trimEnd());
    return;
  }

  try {
    fs.appendFileSync(logFilePath, line, 'utf8');
  } catch {
    console.log(line.trimEnd());
  }
}

function appRoot() {
  return app.isPackaged ? process.resourcesPath : path.resolve(__dirname, '..');
}

function serverEntryPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'next-standalone', 'server.js')
    : path.join(appRoot(), 'web', '.next', 'standalone', 'server.js');
}

function missionWorkerPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, 'mission-worker.cjs')
    : path.join(appRoot(), 'desktop', 'mission-worker.cjs');
}

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return null;

  const separatorIndex = trimmed.indexOf('=');
  if (separatorIndex === -1) return null;

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();
  if (!key) return null;

  const quote = value[0];
  if ((quote === '"' || quote === "'") && value.endsWith(quote)) {
    value = value.slice(1, -1);
  }

  return [key, value];
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const parsed = parseEnvLine(line);
    if (!parsed) continue;

    const [key, value] = parsed;
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function loadEnvironment() {
  const candidates = app.isPackaged
    ? [path.join(path.dirname(process.execPath), '.env'), path.join(app.getPath('userData'), '.env')]
    : [path.join(appRoot(), '.env')];

  for (const candidate of candidates) {
    writeLog(`Tentando carregar env: ${candidate}`);
    loadEnvFile(candidate);
  }
}

function ensureLocalSecret(dataDir) {
  if (process.env.TOKEN_STORE_SECRET || process.env.BOT_TOKEN) {
    return;
  }

  const secretPath = path.join(dataDir, '.token-store-secret');
  if (fs.existsSync(secretPath)) {
    process.env.TOKEN_STORE_SECRET = fs.readFileSync(secretPath, 'utf8').trim();
    return;
  }

  const secret = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(secretPath, secret, { encoding: 'utf8', mode: 0o600 });
  process.env.TOKEN_STORE_SECRET = secret;
}

function ensureRuntimeEnvironment(port) {
  const dataDir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  logFilePath = path.join(app.getPath('userData'), 'desktop.log');
  writeLog(`Iniciando Mission Tools ${app.getVersion()} packaged=${app.isPackaged}`);
  ensureLocalSecret(dataDir);

  process.env.PORT = String(port);
  process.env.HOSTNAME = '127.0.0.1';
  process.env.NODE_ENV = 'production';
  process.env.WEB_BASE_URL = `http://127.0.0.1:${port}`;
  process.env.MISSION_TOOLS_DATA_DIR = process.env.MISSION_TOOLS_DATA_DIR || dataDir;
  process.env.TOKEN_STORE_PATH = process.env.TOKEN_STORE_PATH || path.join(dataDir, 'mission-tokens.json');
  process.env.WEB_LOG_STORE_PATH = process.env.WEB_LOG_STORE_PATH || path.join(dataDir, 'web-logs.json');
  process.env.WEB_SETTINGS_STORE_PATH = process.env.WEB_SETTINGS_STORE_PATH || path.join(dataDir, 'web-settings.json');
  process.env.PANEL_STORE_PATH = process.env.PANEL_STORE_PATH || path.join(dataDir, 'mission-panels.json');
  process.env.MISSION_TOOLS_WORKER_PATH = process.env.MISSION_TOOLS_WORKER_PATH || missionWorkerPath();

  if (!app.isPackaged) {
    process.env.MISSION_TOOLS_PROJECT_ROOT = process.env.MISSION_TOOLS_PROJECT_ROOT || appRoot();
  }

  writeLog(`Servidor interno usara porta ${port}`);
  writeLog(`Dados do app: ${dataDir}`);
  writeLog(`Server entry: ${serverEntryPath()}`);
  writeLog(`Worker entry: ${process.env.MISSION_TOOLS_WORKER_PATH}`);
}

function findAvailablePort(preferredPort = 3765) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(preferredPort, '127.0.0.1', () => {
      const address = server.address();
      const port = typeof address === 'object' && address ? address.port : preferredPort;
      server.close(() => resolve(port));
    });
  }).catch(() => {
    return new Promise((resolve, reject) => {
      const server = net.createServer();
      server.unref();
      server.on('error', reject);
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        const port = typeof address === 'object' && address ? address.port : preferredPort;
        server.close(() => resolve(port));
      });
    });
  });
}

function waitForServer(url, timeoutMs = 30000) {
  const startedAt = Date.now();
  writeLog(`Aguardando servidor: ${url}`);

  return new Promise((resolve, reject) => {
    const check = () => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve();
      });

      request.on('error', () => {
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`O servidor interno nao iniciou em ${timeoutMs / 1000}s.`));
          return;
        }

        setTimeout(check, 350);
      });
    };

    check();
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 960,
    minHeight: 640,
    title: 'Mission Tools',
    backgroundColor: '#070a12',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  const isInternalAppUrl = (url) => {
    try {
      const parsedUrl = new URL(url);
      return (
        parsedUrl.protocol === 'http:' &&
        ['127.0.0.1', 'localhost', '[::1]'].includes(parsedUrl.hostname)
      );
    } catch {
      return false;
    }
  };

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isInternalAppUrl(url)) {
      return { action: 'allow' };
    }

    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (!isInternalAppUrl(url)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function loadStatusPage(message) {
  if (!mainWindow) return;

  const html = `
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Mission Tools</title>
        <style>
          :root { color-scheme: dark; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
          * { box-sizing: border-box; }
          body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #070a12; color: #f8fafc; }
          main { width: min(100% - 32px, 460px); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; background: rgba(15,23,42,.86); padding: 28px; }
          h1 { margin: 0 0 10px; font-size: 24px; }
          p { margin: 0; color: #cbd5e1; line-height: 1.6; }
        </style>
      </head>
      <body>
        <main>
          <h1>Mission Tools</h1>
          <p>${message}</p>
        </main>
      </body>
    </html>`;

  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
}

async function startNextServer(port) {
  const entry = serverEntryPath();
  if (!fs.existsSync(entry)) {
    throw new Error(`Build do painel nao encontrado: ${entry}`);
  }

  const env = {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1'
  };

  serverProcess = spawn(process.execPath, [entry], {
    cwd: path.dirname(entry),
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true
  });

  writeLog(`Processo do servidor iniciado pid=${serverProcess.pid}`);

  serverProcess.stdout?.on('data', (chunk) => {
    writeLog(`[server stdout] ${chunk.toString('utf8').trimEnd()}`);
  });
  serverProcess.stderr?.on('data', (chunk) => {
    writeLog(`[server stderr] ${chunk.toString('utf8').trimEnd()}`);
  });

  serverProcess.once('exit', (code) => {
    writeLog(`Servidor interno encerrou com codigo ${code ?? 'n/a'}`);
    if (mainWindow && code !== 0) {
      loadStatusPage('O servidor interno do painel foi encerrado.');
    }
  });

  await waitForServer(`http://127.0.0.1:${port}/login`);
}

function stopNextServer() {
  if (!serverProcess || serverProcess.killed) return;
  serverProcess.kill();
  serverProcess = null;
}

async function boot() {
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
  logFilePath = path.join(app.getPath('userData'), 'desktop.log');
  loadEnvironment();
  const port = await findAvailablePort();
  ensureRuntimeEnvironment(port);

  createMainWindow();
  loadStatusPage('Iniciando painel local...');

  try {
    await startNextServer(port);
    writeLog('Servidor interno pronto.');
    await mainWindow.loadURL(`http://127.0.0.1:${port}/login`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    writeLog(`Falha ao iniciar: ${message}`);
    loadStatusPage(`Nao foi possivel iniciar o aplicativo. ${message}`);
    dialog.showErrorBox('Mission Tools', message);
  }
}

app.whenReady().then(boot);

app.on('window-all-closed', () => {
  stopNextServer();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopNextServer();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    boot();
  }
});
