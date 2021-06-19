const { app, BrowserWindow, ipcMain, session, Menu, Tray } = require('electron');
const { spawn } = require('child_process')
const fs = require('fs');
let tray = null; //Menu icon
let daemon = null; //IPFS daemon
let userDataPath = null;
let tempUploadPath = null; //True while upload is active
let win = null; //Main window

function createWindow() {
  if (win) return; //Ignore if window is already created

  win = new BrowserWindow({
    width: 800,
    height: 360,
    minWidth: 400,
    minHeight: 300,
    backgroundColor: "#222",
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 9, y: 12 },
    webPreferences: {
      nodeIntegration: true
    }
  })

  win.webContents.openDevTools();
  win.webContents.on('devtools-opened', () => {
    win.loadFile('src/index.html')
  });
  win.once('closed', () => win = null);
}

function createTray() {
  tray = new Tray('src/assets/testTemplate.png');
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open ohm', type: 'normal', click: () => createWindow() },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', role: 'quit', accelerator: 'CmdOrCtrl+Q' },
  ]);
  tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
  session.defaultSession.cookies.on('changed', (event, cookie, cause) => { //TESTING PURPOSES
    console.log(cause + ' Expiration: ' + cookie.expirationDate + ' ' + Date())
    session.defaultSession.cookies.get({}).then(cookies => { if (cookies[0]) console.log(cookies[0].expirationDate)});
  });

  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();

  app.dock.hide();
})

app.on('will-quit', async (e) => {
  if (daemon && tempUploadPath) {
    e.preventDefault();
    try {
      if (tempUploadPath) await clearUploadMFS(); //Clear MFS if an upload is currently taking place
      if (daemon) daemon.kill(); //Kill daemon if running
      daemon = null; //Prevent infinite loop
      app.quit();
    }
    catch (err) {
      console.log(err);
      if (daemon) daemon.kill(); //Kill daemon if running
      daemon = null; //Prevent infinite loop
      app.quit();
    }
  }
  else if (daemon) daemon.kill();
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
  if (!fs.existsSync(`${userDataPath}/transfers.json`)) fs.writeFileSync(`${userDataPath}/transfers.json`,'{}');

  if (daemon) return event.reply('daemon-ready', userDataPath); //Check if daemon is already running

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
    console.log(`stdout: ${data}`);
    if (data.toString().match(/(?:daemon is running|Daemon is ready)/)) {
      event.reply('daemon-ready', userDataPath);
    }
  });

  daemon.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  daemon.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    daemon = null;
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
    let init = spawn(require('go-ipfs').path(), ['files', 'rm', '-r', tempUploadPath]);
    console.log(tempUploadPath)

    init.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });

    init.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });

    init.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      resolve();
    });

    init.on('error', (err) => {
      console.log(err);
      resolve();
    })
  });
}
