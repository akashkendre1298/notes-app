import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { format as formatUrl } from 'url';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDevelopment = process.env.NODE_ENV !== 'production';

let mainWindow;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDevelopment) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadURL(
      formatUrl({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file',
        slashes: true,
      })
    );
  }
};

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// File path for notes
// const NOTES_PATH = path.join(__dirname, 'notes.json');
const NOTES_PATH = path.join(app.getPath('userData'), 'notes.json');

// Ensure file exists
if (!fs.existsSync(NOTES_PATH)) {
  fs.writeFileSync(NOTES_PATH, JSON.stringify([]));
}

// IPC handlers for CRUD
ipcMain.handle('get-notes', async () => {
  const data = fs.readFileSync(NOTES_PATH, 'utf-8');
  return JSON.parse(data);
});

ipcMain.handle('save-notes', async (event, notes) => {
  fs.writeFileSync(NOTES_PATH, JSON.stringify(notes, null, 2));
  return { status: 'success' };
});
