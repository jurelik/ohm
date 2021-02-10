'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./nav');
const ExploreView = require('./exploreView');
const SongView = require('./songView');
const Player = require('./player');
const Header = require('./header');

function Client() {
  this.node;
  this.root = document.querySelector('.root');
  this.content = document.querySelector('.content');
  this.playerEl = document.querySelector('.player');
  this.headerEl = document.querySelector('.header');
  this.nav = new Nav();
  this.exploreView = new ExploreView();
  this.songView = new SongView();
  this.player = new Player();
  this.header = new Header();

  this.playing = false;
  this.history = [{ type: 'explore' }];
  this.historyIndex = 0;

  this.init = () => {
    this.header.init();
    this.nav.init();
    this.exploreView.init();
    this.player.init();

    //Init an ipfs daemon & create a node
    ipcRenderer.on('daemon-ready', async () => {
      this.node = createClient();
    });

    ipcRenderer.send('start');
  }

  this.changeView = (view, data) => {
    this.content.innerHTML = '';

    switch (view) {
      case 'explore':
        return this.exploreView.render();
      case 'song':
        return this.songView.render(data);
      default:
        return this.content.innerHTML = view;
    }
  }

  this.addToHistory = (type, data) => {
    //Check for duplicates on last index
    const len = this.history.length - 1;
    const _type = this.history[len].type;
    const _dataId = this.history[len].data ? this.history[len].data.id : undefined;
    if (data && type === _type && data.id === _dataId) return;
    else if (!data && type === _type) return;

    //Clear all history above current index
    this.history.splice(this.historyIndex + 1, len);

    this.history.push({
      type,
      data
    })
    this.header.backButton.className = 'enabled';
    this.header.forwardButton.className = 'disabled';
    this.historyIndex++;
  }

  this.selectAlbum = (album) => {
    console.log(album);
  }

  this.handlePlayPause = () => {
    this.playing = !this.playing;
    this.player.play();
  }
}
