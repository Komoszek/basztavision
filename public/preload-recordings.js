require('module-alias/register')
const {contextBridge,remote,ipcRenderer} = require('electron');


const Store = require("electron-store");

const fs = require("fs");

const store = new Store();

var chokidar = require('chokidar');

var watcherList = {}

//fix it
var watcherId = -1;

contextBridge.exposeInMainWorld('electron', {
  startWatcher: (path,opt,onAdd,onUnlink) => {
    console.log('chokimilk')
    watcherList[++watcherId] = chokidar.watch(path, opt)
    .on('add', onAdd).on('unlink', onUnlink)

    return watcherId
  },
  closeWatcher: id => watcherList[id].close(),
  getVideos: path => fs.readdirSync(path,
  { withFileTypes: true }).filter(dirent => dirent.isFile()).map(dirent => dirent.name),
  getUnits: (recordingPath) => fs.readdirSync(recordingPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
})

contextBridge.exposeInMainWorld('store', {
  get: (id, def=undefined) => ipcRenderer.sendSync('storeGet', {id:id,def:def}),
  set: async (id, value) => await ipcRenderer.invoke('storeSet', {id:id,value:value}),
})
