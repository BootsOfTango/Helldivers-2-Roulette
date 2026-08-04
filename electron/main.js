const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const { loadStateFile, saveStateFile, validateData } = require('./storage');

const APP_ID = 'com.bootsoftango.helldivers2chaosroulette';
const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@BootsOfTango';

function isAllowedExternalUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && ['www.youtube.com', 'youtube.com', 'youtu.be'].includes(parsed.hostname);
  } catch {
    return false;
  }
}

async function openAllowedExternal(url) {
  if (!isAllowedExternalUrl(url)) return false;
  await shell.openExternal(url);
  return true;
}

function createMainWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 1100,
    minHeight: 720,
    title: 'Helldivers 2 Chaos Roulette',
    icon: path.join(__dirname, '..', 'build', 'icon.png'),
    backgroundColor: '#060805',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      devTools: !app.isPackaged
    }
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isAllowedExternalUrl(url)) {
      void openAllowedExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const currentUrl = mainWindow.webContents.getURL();
    if (url !== currentUrl) {
      event.preventDefault();
      if (isAllowedExternalUrl(url)) {
        void openAllowedExternal(url);
      }
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

  return mainWindow;
}

app.setAppUserModelId(APP_ID);

ipcMain.handle('app:getInfo', () => ({
  name: 'Helldivers 2 Chaos Roulette',
  appId: APP_ID,
  version: app.getVersion()
}));

ipcMain.handle('links:openYouTubeChannel', () => openAllowedExternal(YOUTUBE_CHANNEL_URL));

ipcMain.handle('storage:load', () => loadStateFile(app.getPath('userData')));
ipcMain.handle('storage:save', (_event, data) => {
  validateData(data);
  return saveStateFile(app.getPath('userData'), data, app.getVersion());
});
ipcMain.handle('storage:openSaveFolder', () => shell.openPath(app.getPath('userData')));

app.whenReady().then(() => {
  createMainWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
