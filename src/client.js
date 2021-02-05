'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./nav');

function Client() {
  this.node;
  this.root = document.querySelector('.root');
  this.content = document.querySelector('.content');
  this.nav = new Nav();

  this.init = () => {
    this.nav.init();
    //Init an ipfs daemon & create a node
    ipcRenderer.on('daemon-ready', async () => {
      this.node = createClient();
    });

    ipcRenderer.send('start');
  }

  this.changePage = (page) => {
    this.content.innerHTML = page;
  }
}
