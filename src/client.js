'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./nav');
const ExploreView = require('./exploreView');
const Player = require('./player');

function Client() {
  this.node;
  this.root = document.querySelector('.root');
  this.content = document.querySelector('.content');
  this.playerEl = document.querySelector('.player');
  this.nav = new Nav();
  this.exploreView = new ExploreView();
  this.player = new Player();

  this.playing = false;

  this.init = () => {
    this.nav.init();
    this.exploreView.init();
    this.player.init();
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
        this.exploreView.render();
        break;
      default:
        this.content.innerHTML = page;
        break;
    }
  }

  this.selectSong = (song) => {
    console.log(song);
  }

  this.selectAlbum = (album) => {
    console.log(album);
  }

  this.handlePlayPause = () => {
    this.playing = !this.playing;
    this.player.play();
  }
}
