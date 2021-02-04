const { app, BrowserWindow, ipcMain } = require('electron');
const { spawn } = require('child_process')
let daemon;

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
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

ipcMain.on('start', () => {
  daemon = spawn(require('go-ipfs').path(), ['daemon'])

  daemon.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    if (data.toString().match(/(?:daemon is running|Daemon is ready)/)) {
      console.log('Daemon ready')
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
});
