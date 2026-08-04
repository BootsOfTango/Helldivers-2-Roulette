const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chaosRoulette', Object.freeze({
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
  openYouTubeChannel: () => ipcRenderer.invoke('links:openYouTubeChannel')
}));
