const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('chaosRoulette', Object.freeze({
  getAppInfo: () => ipcRenderer.invoke('app:getInfo'),
  openYouTubeChannel: () => ipcRenderer.invoke('links:openYouTubeChannel'),
  loadState: () => ipcRenderer.invoke('storage:load'),
  saveState: (data) => ipcRenderer.invoke('storage:save', data),
  exportJson: (data) => ipcRenderer.invoke('storage:exportJson', data),
  importJson: () => ipcRenderer.invoke('storage:importJson'),
  clearAll: (data) => ipcRenderer.invoke('storage:clearAll', data),
  openSaveFolder: () => ipcRenderer.invoke('storage:openSaveFolder')
}));
