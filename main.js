const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron');
const { spawn } = require('child_process')
const fs = require('fs');
let tray = null; //Menu icon
let daemon = null; //IPFS daemon
let userDataPath = null;
let tempUploadPath = null; //True while upload is active
let win = null; //Main window
let view = null; //Which view should we open with ('explore' being default)
let quitting = false; //Is the app in the process of quitting

const DEFAULT_SETTINGS = {
  DOWNLOAD_PATH: `${process.env.HOME}/Documents/ohm`,
  IPFS_PROTOCOL: 'http',
  IPFS_HOST: 'localhost',
  IPFS_PORT: 5001,
  IPFS_PATH: 'api/v0'
}

function createWindow() {
  if (win) return win.show(); //Ignore if window is already created

  win = new BrowserWindow({
    width: 800,
    height: 360,
    minWidth: 400,
    minHeight: 300,
    backgroundColor: "#222",
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 9, y: 6 },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  app.dock.show();
  win.webContents.openDevTools();
  win.webContents.on('devtools-opened', () => {
    win.loadFile('src/index.html')
  });
  win.once('closed', () => win = null);
}

function createTray() {
  tray = new Tray('src/assets/testTemplate.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open ohm', type: 'normal', click: createWindow },
    { label: 'Settings', type: 'normal', click: openSettings },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', role: 'quit', accelerator: 'CmdOrCtrl+Q' },
  ]);
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();

  app.dock.hide();
})

app.on('will-quit', async (e) => {
  quitting = true;

  if (tempUploadPath) { //If a file is currently being uploaded make sure to delete MFS before quitting
    e.preventDefault();

    try {
      await clearUploadMFS(); //Clear MFS
      daemon.kill();
    }
    catch (err) {
      console.log(err);
      daemon.kill();
    }
  }
  else if (daemon) {
    e.preventDefault();
    daemon.kill();
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

//IPC events
ipcMain.on('start', (event) => {
  //Check if config / transfers files exist
  userDataPath = app.getPath('userData');
  if (!fs.existsSync(`${userDataPath}/transfers.json`)) fs.writeFileSync(`${userDataPath}/transfers.json`, '{}');
  if (!fs.existsSync(`${userDataPath}/settings.json`)) fs.writeFileSync(`${userDataPath}/settings.json`, JSON.stringify(DEFAULT_SETTINGS, null, 2));

  if (daemon) { //Check if daemon is already running
    event.reply('daemon-ready', { userDataPath, view: view || 'explore' });
    return view = null; //Reset view to null
  }

  //Check if the repo exists already
  if (fs.existsSync(`/Users/${process.env.USER}/.ohm-ipfs`)) {
    spawnDaemon(event);
  }
  else {
    initRepo(event);
  }
});

ipcMain.on('upload-start', (event, arg) => { //When upload starts, make note of MFS path so that we can delete it on force close during upload
  tempUploadPath = arg;
});

ipcMain.on('upload-end', (event) => { //Reset tempUploadPath when upload ends/fails
  tempUploadPath = null;
});

const spawnDaemon = (event) => {
  daemon = spawn(require('go-ipfs').path(), ['daemon', '--routing=dhtclient'])

  daemon.stdout.on('data', (data) => {
    console.log(`${data}`);
    if (data.toString().match(/(?:daemon is running|Daemon is ready)/)) {
      event.reply('daemon-ready', { userDataPath, view: 'explore' });
    }
  });

  daemon.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  daemon.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    daemon = null;
    if (quitting) app.quit();
  });

  daemon.on('error', (err) => {
    console.log(err)
  })
}

const initRepo = (event) => {
  let init = spawn(require('go-ipfs').path(), ['init']);

  init.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
  });

  init.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  init.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    spawnDaemon(event);
  });

  init.on('error', (err) => {
    console.log(err)
  })
}

const clearUploadMFS = () => {
  return new Promise((resolve) => {
    let clearMFS = spawn(require('go-ipfs').path(), ['files', 'rm', '-r', tempUploadPath]);

    clearMFS.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    clearMFS.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    clearMFS.on('close', (code) => {
      console.log(`Successfully stopped current upload.`);
      tempUploadPath = null; //Reset tempUploadPath
      resolve();
    });

    clearMFS.on('error', (err) => {
      console.log(err);
      resolve();
    })
  });
}

const openSettings = () => {
  if (!win) {
    view = 'settings';
    return createWindow();
  }

  win.show();
  win.webContents.send('open-settings');
}
