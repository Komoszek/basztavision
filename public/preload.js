const {contextBridge,remote,ipcRenderer} = require('electron');

const fs = require('fs');

const grabber = require(`./grabber.node`);
const spawn = require('child_process').spawn;

var ffmpegInstance = {};
const Minute = 60000;

const getFromStore = (id, def=undefined) => ipcRenderer.sendSync('storeGet', {id:id,def:def});

contextBridge.exposeInMainWorld('electron', {
  fs:fs,
  spawn: spawn,
  grabber: grabber,
  newffmpeg: (id, path, width, height) => {
    if (!fs.existsSync(path))
      fs.mkdirSync(path, { recursive: true });

    ffmpegInstance[id] = spawn('ffmpeg',['-y', '-f', 'image2pipe','-use_wallclock_as_timestamps','1','-s', `${width}x${height}`, '-i', '-','-vsync', '0', '-vcodec', 'libx264','-crf', getFromStore('recording.crf'), `${path}/${Date.now()}.mkv`]);
    setTimeout(() => {
      var temp = ffmpegInstance[id];
      delete ffmpegInstance[id];
      temp.stdin.end();
    },parseInt(getFromStore('recording.chunkLength'))*Minute);
  },
  isffmpegInstanceRunning: id => ffmpegInstance.hasOwnProperty(id),
  writeFrame: async (id, blob) => {
    try {
      ffmpegInstance[id].stdin.write(Buffer.from(await blob));
    } catch (e) {
      console.error(e);
    }
  }
})

contextBridge.exposeInMainWorld('store', {
  get: getFromStore,
  set: async (id, value) => await ipcRenderer.invoke('storeSet', {id:id,value:value}),
})
