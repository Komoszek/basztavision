const {contextBridge,remote,ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electron', {
  relaunchApp: () => ipcRenderer.invoke('relaunchApp')
})

contextBridge.exposeInMainWorld('store', {
  get: (id, def=undefined) => ipcRenderer.sendSync('storeGet', {id:id,def:def}),
  set: async (id, value) => await ipcRenderer.invoke('storeSet', {id:id,value:value}),
  clear: (id, value) => ipcRenderer.invoke('storeClear')
})
