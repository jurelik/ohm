const { app, BrowserWindow, ipcMain, Menu, Tray, nativeTheme, shell } = require('electron');
const { spawn } = require('child_process')
const menuTemplate = require('./src/utils/menuTemplate');
const os = require('os');
const path = require('path');
const fs = require('fs');
let tray = null; //Menu icon
let daemon = null; //IPFS daemon
const userDataPath = app.getPath('userData'); //Check if config / transfers files exist
let tempUploadPath = null; //True while upload is active
let win = null; //Main window
let view = null; //Which view should we open with ('explore' being default)
let quitting = false; //Is the app in the process of quitting
let settings = null; //User settings
let remoteNode = false; //Is the ipfs node hosted on an external machine?

const DEFAULT_SETTINGS = {
  GENERAL: {
    OHM_SERVER: 'api.ohm.rip',
    DOWNLOAD_PATH: path.join(os.homedir(), 'Documents', 'ohm'),
    IPFS_REPO_PATH: path.join(os.homedir(), '.ohm-ipfs'),
    OPEN_DEV: 'false',
  },
  APPEARANCE: {
    WIDTH: '640',
    HEIGHT: '360',
    FRAMELESS: 'false',
    OS_THEME: 'system',
  },
  IPFS: {
    IPFS_API_PROTOCOL: 'http',
    IPFS_API_HOST: 'localhost',
    IPFS_API_PORT: '5001',
    IPFS_API_PATH: 'api/v0'
  }
}

const createWindow = () => {
  if (win) return win.show(); //Ignore if window is already created

  win = new BrowserWindow({
    width: parseInt(settings.WIDTH),
    height: parseInt(settings.HEIGHT),
    minWidth: 480,
    minHeight: 300,
    backgroundColor: "#222",
    icon: path.join(__dirname, 'src', 'assets', 'icon', { darwin: 'icon.icns', linux: 'icon.png', win32: 'icon.ico' }[process.platform] || 'icon.ico'),
    titleBarStyle: process.platform === 'darwin' ? 'hidden' : 'default',
    frame: process.platform !== 'darwin' && settings.FRAMELESS === 'true' ? false : true,
    autoHideMenuBar: true,
    trafficLightPosition: { x: 9, y: 6 },
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen: true
    }
  })

  if (process.platform === 'darwin') app.dock.show();
  if (settings.OPEN_DEV === 'true') {
    win.webContents.openDevTools();
    win.webContents.on('devtools-opened', () => {
      win.loadFile('src/index.html');
    });
  }
  else win.loadFile('src/index.html');

  //Window event handlers
  win.once('closed', () => win = null);
  win.on('resize', handleResize);
}

app.whenReady().then(() => {
  //Get user settings
  if (fs.existsSync(path.join(userDataPath, 'settings.json'))) settings = flattenSettings(JSON.parse(fs.readFileSync(path.join(userDataPath, 'settings.json'))));
  else {
    fs.writeFileSync(path.join(userDataPath, 'settings.json'), JSON.stringify(DEFAULT_SETTINGS, null, 2));
    settings = flattenSettings(DEFAULT_SETTINGS);
  }

  remoteNode = settings.IPFS_API_HOST === 'localhost' || settings.IPFS_API_HOST === '127.0.0.1' ? false : true; //Update remoteNode

  createMenu();
  createTray();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') app.dock.hide();
});

app.on('will-quit', async (e) => {
  quitting = true;

  if (tempUploadPath) { //If a file is currently being uploaded make sure to delete MFS before quitting
    e.preventDefault();

    try {
      await clearUploadMFS(); //Clear MFS
      if (remoteNode) app.quit();
      else daemon.kill();
    }
    catch (err) {
      console.log(err);
      if (remoteNode) app.quit();
      else daemon.kill();
    }
  }
  else if (daemon && !remoteNode) {
    e.preventDefault();
    daemon.kill();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

//IPC events
ipcMain.on('start', (event) => {
  process.env.IPFS_PATH = settings.IPFS_REPO_PATH || path.join(os.homedir(), '.ohm-ipfs'); //Set IPFS_PATH
  if (!fs.existsSync(path.join(userDataPath, 'transfers.json'))) fs.writeFileSync(path.join(userDataPath, 'transfers.json'), '{}');

  if (daemon) { //Check if daemon is already running
    event.reply('daemon-ready', { userDataPath, view: view || 'explore', remote: remoteNode });
    return view = null; //Reset view to null
  }

  if (remoteNode) { //Don't run daemon if the ipfs node is remote
    daemon = 'remote'; //Set value of daemon so we know it is assumed to be running
    event.reply('daemon-ready', { view: 'explore', remote: true });

    //Update tray
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate(true));
    tray.setContextMenu(contextMenu)
    return;
  }

  //Check if the repo exists already
  if (fs.existsSync(process.env.IPFS_PATH)) spawnDaemon(event);
  else initRepo(event);
});

ipcMain.on('upload-start', (event, arg) => { //When upload starts, make note of MFS path so that we can delete it on force close during upload
  tempUploadPath = arg;
});

ipcMain.on('upload-end', event => { //Reset tempUploadPath when upload ends/fails
  tempUploadPath = null;
});

ipcMain.on('login', event => {
  event.reply('login', { OHM_SERVER: settings.OHM_SERVER, userDataPath });
});

const spawnDaemon = (event) => {
  daemon = spawn(require('go-ipfs').path(), ['daemon', '--routing=dhtclient'])

  daemon.stdout.on('data', (data) => {
    console.log(`${data}`);
    if (data.toString().match(/(?:daemon is running|Daemon is ready)/)) {
      event.reply('daemon-ready', { view: 'explore', remote: false });

      //Update tray
      const contextMenu = Menu.buildFromTemplate(trayMenuTemplate(true));
      tray.setContextMenu(contextMenu)
    }
  });

  daemon.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    win.webContents.send('ipfs-error', data);
  });

  daemon.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    daemon = null;

    if (quitting) return app.quit();

    //Update tray
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate(false));
    tray.setContextMenu(contextMenu)
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

const flattenSettings = (original) => {
  const flattened = {};

  for (const section in original) {
    for (const setting in original[section]) flattened[setting] = original[section][setting];
  }

  return flattened;
}

const trayMenuTemplate = (running) => {
  return [
    { label: running ? 'Daemon is running...' : 'Daemon is not running...', type: 'normal', enabled: false },
    { label: 'Open ohm', type: 'normal', click: createWindow },
    { label: 'Settings', type: 'normal', click: openSettings },
    { type: 'separator' },
    { label: 'Quit', type: 'normal', role: 'quit', accelerator: 'CmdOrCtrl+Q' },
  ];
}

const handleResize = () => {
  const size = win.getSize();

  if (settings) {
    const _settings = JSON.parse(fs.readFileSync(path.join(userDataPath, 'settings.json')));
    _settings.WIDTH = size[0].toString();
    _settings.HEIGHT = size[1].toString();
    fs.writeFileSync(path.join(userDataPath, 'settings.json'), JSON.stringify(_settings, null, 2));
  }
}

const createMenu = () => {
  const menu = Menu.buildFromTemplate(menuTemplate(app.name, { openSettings }));
  Menu.setApplicationMenu(menu);
}

const createTray = () => {
  const trayIconPath = getTrayIconPath();
  tray = new Tray(trayIconPath);
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate(false));
  if (process.platform === 'linux') tray.setToolTip('ohm'); //Set tooltip if on linux
  tray.setContextMenu(contextMenu)
}

const getTrayIconPath = () => {
  const { OS_THEME } = JSON.parse(fs.readFileSync(path.join(userDataPath, 'settings.json')));

  switch (process.platform) {
    case 'darwin':
      return path.join(__dirname, 'src', 'assets', 'tray', 'trayLightTemplate.png');
    case 'linux':
      if (settings) { //Check if user decided to overwrite default tray icon color
        if ( OS_THEME === 'dark' ) return path.join(__dirname, 'src', 'assets', 'tray', 'trayDark.png');
        else if ( OS_THEME === 'light' ) return path.join(__dirname, 'src', 'assets', 'tray', 'trayLightTemplate.png');
      }

      return path.join(__dirname, 'src', 'assets', 'tray', `tray${nativeTheme.shouldUseDarkColors ? 'Dark' : 'LightTemplate'}.png`);
    case 'win32':
      if (settings) { //Check if user decided to overwrite default tray icon color
        if ( OS_THEME === 'dark' ) return path.join(__dirname, 'src', 'assets', 'tray', 'trayDark.png');
        else if ( OS_THEME === 'light' ) return path.join(__dirname, 'src', 'assets', 'tray', 'trayLightTemplate.png');
      }

      return path.join(__dirname, 'src', 'assets', 'tray', `trayDark.png`);
    default:
      return path.join(__dirname, 'src', 'assets', 'tray', 'trayLightTemplate.png');
  }
}

