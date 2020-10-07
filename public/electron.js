const isDev = require("electron-is-dev");

// Modules to control application life and create native browser window
const {app, BrowserWindow, Menu, protocol} = require('electron');
const path = require('path');
const findRemoveSync = require('find-remove');

const IntervalTime = 1800000;

app.whenReady().then(() => {
  protocol.registerFileProtocol('file', (request, callback) => {
    callback(request.url.replace('file:///', ''));
  });
});

const fs = require('fs');

const Store = require('electron-store');

const store = new Store();
//Default config values
if(!store.has('video.height'))
  store.set('video.height', 480);
if(!store.has('video.width'))
  store.set('video.width', 640);
if(!store.has('video.path'))
  store.set('video.path', '/dev/video0');
if(!store.has('video.numberOfUnits'))
  store.set('video.numberOfUnits', 1);
if(!store.has('recording.enable'))
  store.set('recording.enable', false);
if(!store.has('recording.chunkLength'))
  store.set('recording.chunkLength', 30);
if(!store.has('recording.keepTime'))
  store.set('recording.keepTime', 48);
if(!store.has('recording.path'))
  store.set('recording.path', `${app.getPath('videos')}/less`);
try {
  fs.accessSync(store.get('recording.path'), fs.constants.R_OK | fs.constants.W_OK);
} catch (err) {
  store.set('recording.path', `${app.getPath('videos')}/less`);
}


if(!store.has('recording.quality'))
  store.set('recording.quality', 0.6);
if(!store.has('recording.crf'))
  store.set('recording.crf', 28);

for(var i = 0;i<store.get('video.numberOfUnits');i++)
  fs.mkdirSync(`${store.get('recording.path')}/camera${i}`, { recursive: true });

var units = fs.readdirSync(store.get('recording.path'), { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);


for(key in units){
  findRemoveSync(`${store.get('recording.path')}/${units[key]}/`, {age: {seconds: parseInt(store.get('recording.keepTime'))*3600},files: "*.*"});

  if(store.get('recording.enable'))
    setInterval(findRemoveSync.bind(this, `${store.get('recording.path')}/${units[key]}/`, {age: {seconds: parseInt(store.get('recording.keepTime'))*3600},files: "*.*"}), IntervalTime);
}

const template = [
  {
    label: 'Ustawienia',
    click() {
          openNewWindow('settings', 600, 300, 'LESS - Ustawienia')
        }
  },
  {
    label: 'Nagrania',
    click() {
          openNewWindow('recordings', 700, 900, 'LESS - Nagrania')
        }
  },
  {
   label: 'View',
   submenu: [
     { role: 'toggledevtools' }
   ]
 }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

var windows = {};

function openNewWindow(winPath, height, width, title) {
  if (windows.hasOwnProperty(winPath)) {
    windows[winPath].focus()
    return;
  }

  windows[winPath] = new BrowserWindow({
    height: height,
    //resizable: false,
    width: width,
    title: title,
    show:false,
    //minimizable: false,
    webPreferences: {
      nodeIntegration:true,
      enableRemoteModule:true,
      webSecurity: !isDev
    }
    //fullscreenable: false
  })


  windows[winPath].loadURL(
      isDev
      ? `http://localhost:3000/index.html#${winPath}`
      : `file://${path.join(__dirname, `../build/index.html#${winPath}`)}`
  )


    if(!isDev) windows[winPath].setMenu(null)
    windows[winPath].webContents.on('did-finish-load', function() {
        windows[winPath].show();
    });

  windows[winPath].on('closed', function() {
    delete windows[winPath];
  })
}

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'LESS - CCTV',
    webPreferences: {
      nodeIntegration:true,
      enableRemoteModule:true
    }
  })

  // and load the index.html of the app.
  mainWindow.loadURL(
      isDev
      ? "http://localhost:3000"
      : `file://${path.join(__dirname, "../build/index.html")}`
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

const gotTheLock = app.requestSingleInstanceLock();
let myWindow = null;
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (myWindow) {
      if (myWindow.isMinimized()) myWindow.restore()
      myWindow.focus()
    }
  })

  // Create myWindow, load the rest of the app, etc...
  app.on('ready', () => {
    createWindow();

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
