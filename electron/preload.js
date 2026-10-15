const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('dialog:openFile'),
  saveFileDialog: (defaultName) => ipcRenderer.invoke('dialog:saveFile', defaultName),
  convertMarkdown: (markdown, outputPath, options) =>
    ipcRenderer.invoke('convert:markdown', { markdown, outputPath, options }),
  readFile: (filePath) => ipcRenderer.invoke('fs:readFile', filePath),
  openInDefaultApp: (filePath) => ipcRenderer.invoke('shell:openFile', filePath),
  showInExplorer: (filePath) => ipcRenderer.invoke('shell:showInFolder', filePath),
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  getPathForFile: (file) => (webUtils ? webUtils.getPathForFile(file) : file.path),
  isElectron: true
});
