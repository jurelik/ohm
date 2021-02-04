'use strict'

const { ipcRenderer } = require('electron');

function Client() {
  ipcRenderer.send('start');
}
