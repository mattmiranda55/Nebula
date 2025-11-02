/* eslint-disable @typescript-eslint/no-explicit-any */
import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url'
import fs from 'fs/promises';

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;

// Connections are persisted to a JSON file in userData for portability (avoids native deps)
const connectionsFile = path.join(app.getPath('userData'), 'connections.json');
const settingsFile = path.join(app.getPath('userData'), 'settings.json');

async function ensureConnectionsFile() {
  try {
    await fs.stat(connectionsFile);
  } catch (err) {
    // create empty file
    await fs.mkdir(path.dirname(connectionsFile), { recursive: true });
    await fs.writeFile(connectionsFile, JSON.stringify([]), 'utf-8');
    console.error('created new connections file', err ?? '');
  }
}

async function loadConnectionsFromDisk() {
  await ensureConnectionsFile();
  const raw = await fs.readFile(connectionsFile, 'utf-8');
  try {
    return JSON.parse(raw) as Array<{ id: string; name: string; type: string; config: any }>;
  } catch (err) {
    console.error('failed to parse connections file', err ?? '');
    return [];
  }
}

async function saveConnectionsToDisk(list: any[]) {
  await fs.writeFile(connectionsFile, JSON.stringify(list, null, 2), 'utf-8');
}

async function ensureSettingsFile() {
  try {
    await fs.stat(settingsFile);
  } catch (err) {
    await fs.mkdir(path.dirname(settingsFile), { recursive: true });
    await fs.writeFile(settingsFile, JSON.stringify({ theme: 'dark' }), 'utf-8');
  }
}

async function loadSettingsFromDisk() {
  await ensureSettingsFile();
  const raw = await fs.readFile(settingsFile, 'utf-8');
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch (err) {
    console.error('failed to parse settings file', err);
    return { theme: 'dark' };
  }
}

async function saveSettingsToDisk(obj: Record<string, unknown>) {
  await fs.writeFile(settingsFile, JSON.stringify(obj, null, 2), 'utf-8');
}

function registerConnectionIpcHandlers() {
  ipcMain.handle('nebula:load-connections', async () => {
    return await loadConnectionsFromDisk();
  });

  ipcMain.handle('nebula:save-connection', async (_ev, conn) => {
    const list = await loadConnectionsFromDisk();
    const nowId = conn.id || String(Date.now());
    const entry = { id: nowId, name: conn.name, type: conn.type, config: conn.config || {} };
    const idx = list.findIndex((x: any) => x.id === nowId);
    if (idx >= 0) list[idx] = entry; else list.push(entry);
    await saveConnectionsToDisk(list);
    return entry;
  });

  ipcMain.handle('nebula:delete-connection', async (_ev, id) => {
    const list = await loadConnectionsFromDisk();
    const filtered = list.filter((x) => x.id !== id);
    await saveConnectionsToDisk(filtered);
    return { ok: true };
  });

  ipcMain.handle('nebula:open-file', async () => {
    const res = await dialog.showOpenDialog({ properties: ['openFile'] });
    if (res.canceled) return null;
    return res.filePaths[0] || null;
  });

  // Settings handlers
  ipcMain.handle('nebula:load-settings', async () => {
    return await loadSettingsFromDisk();
  });

  ipcMain.handle('nebula:save-settings', async (_ev, obj) => {
    await saveSettingsToDisk(obj || {});
    return { ok: true };
  });

  // Run a SQL query against a connection. Currently supports type === 'sqlite' via sql.js (WASM)
  ipcMain.handle('nebula:run-query', async (_ev, { connectionId, sql }) => {
    const list = await loadConnectionsFromDisk();
    const conn = list.find((x: any) => x.id === connectionId);
    if (!conn) throw new Error('Connection not found');

    if (conn.type === 'sqlite') {
      const targetPath = conn.config.path;
      if (!targetPath) throw new Error('SQLite connection missing path');

      // load sql.js (WASM) dynamically
  const initSqlJs = (await import('sql.js')).default;
      // locateFile for wasm: try to resolve within node_modules
      const SQL = await initSqlJs({ locateFile: (file: string) => path.resolve(__dirname, '..', '..', 'node_modules', 'sql.js', 'dist', file) });

      // read the database file into memory
      const fileBuffer = await fs.readFile(targetPath);
      const u8 = new Uint8Array(fileBuffer);
      const db = new SQL.Database(u8);
      try {
        const trimmed = String(sql).trim();
        const lowered = trimmed.toLowerCase();
        if (lowered.startsWith('select') || lowered.startsWith('pragma') || lowered.startsWith('with')) {
          const results = db.exec(trimmed); // returns array of result objects
          if (!results || results.length === 0) return { columns: [], rows: [] };
          // use first result set
          const r = results[0];
          const columns = r.columns.map((c: string) => ({ name: c, label: c, field: c }));
          const rows = r.values.map((vals: any[]) => {
            const obj: any = {};
            r.columns.forEach((c: string, i: number) => { obj[c] = vals[i]; });
            return obj;
          });
          return { columns, rows };
        } else {
          // run statement(s)
          db.run(trimmed);
          // persist changes back to disk
          const data = db.export();
          await fs.writeFile(targetPath, Buffer.from(data));
          return { info: { message: 'OK' } };
        }
      } finally {
        db.close();
      }
    }

    throw new Error(`Unsupported connection type: ${conn.type}`);
  });
}

async function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/icon.png'), // tray icon
    width: 1000,
    height: 600,
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      // More info: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/electron-preload-script
      preload: path.resolve(
        currentDir,
        path.join(process.env.QUASAR_ELECTRON_PRELOAD_FOLDER, 'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION)
      ),
    },
  });

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  // Do not open devtools automatically. Developers can open them manually when needed.
  // This keeps the app deterministic and avoids unexpected devtools windows in packaged apps.

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });
}

void app.whenReady().then(createWindow);
// initialize the connections storage and IPC handlers when ready
void app.whenReady().then(async () => {
  try {
    await ensureConnectionsFile();
    await ensureSettingsFile();
    registerConnectionIpcHandlers();
  } catch (err) {
    console.error('Failed to init connections storage', err);
  }
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined) {
    void createWindow();
  }
});
