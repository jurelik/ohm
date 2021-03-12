const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process')
const fs = require('fs');
let daemon = null;
let userDataPath = null;

function createWindow () {
  const win = new BrowserWindow({
    width: 480,
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

  win.loadFile('src/index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  daemon.kill();
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

const spawnDaemon = (event) => {
  daemon = spawn(require('go-ipfs').path(), ['daemon'])

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
