'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

function Client() {
  this.node;
  this.root = document.querySelector('.root');

  this.init = () => {
    let test = document.createElement('p');
    test.innerHTML = 'hello'
    this.root.appendChild(test)

    //Init an ipfs daemon & create a node
    ipcRenderer.on('daemon-ready', async () => {
      this.node = createClient();
    });

    ipcRenderer.send('start');
  }
}
