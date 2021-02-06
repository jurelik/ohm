'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./nav');
const Explore = require('./explore');

function Client() {
  this.node;
  this.root = document.querySelector('.root');
  this.content = document.querySelector('.content');
  this.nav = new Nav();
  this.explore = new Explore();

  this.init = () => {
    this.nav.init();
    this.explore.init();
    //Init an ipfs daemon & create a node
    ipcRenderer.on('daemon-ready', async () => {
      this.node = createClient();
    });

    ipcRenderer.send('start');
  }

  this.changePage = (page) => {
    switch (page) {
      case 'explore':
        this.content.innerHTML = '';
        this.explore.render();
        break;
      default:
        this.content.innerHTML = page;
        break;
    }
  }

  this.selectSong = (song) => {
    console.log(song);
  }
}
