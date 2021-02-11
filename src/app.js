'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./components/nav');
const ExploreView = require('./components/exploreView');
const SongView = require('./components/songView');
const Player = require('./components/player');
const Header = require('./components/header');

function App() {
  this.ipfs;
  this.root = document.querySelector('.root');
  this.content = document.querySelector('.content');
  this.nav = new Nav();
  this.exploreView = new ExploreView();
  this.player = new Player();
  this.header = new Header();

  //State
  this.playing = false;
  this.history = [{ type: 'explore' }];
  this.historyIndex = 0;

  this.init = () => {
    this.header.render();
    this.nav.render();
    this.exploreView.init();
    this.player.render();

    //Init an ipfs daemon & create a node
    ipcRenderer.on('daemon-ready', async () => {
      this.ipfs = createClient();
    });

    ipcRenderer.send('start');
  }

  this.changeView = (view, data) => {
    this.content.innerHTML = '';

    switch (view) {
      case 'explore':
        return this.exploreView.render();
      case 'song':
        let songView = new SongView(data.song, data.action);
        return this.content.appendChild(songView.render());
      default:
        return this.content.innerHTML = view;
    }
  }

  this.addToHistory = (type, data) => {
    this.header.backButton.className = 'enabled';
    this.header.forwardButton.className = 'disabled';
    this.historyIndex++;

    //Clear all history above current index
    this.history.splice(this.historyIndex);

    this.history.push({
      type,
      data
    })
  }

  this.selectAlbum = (album) => {
    console.log(album);
  }

  this.handlePlayPause = () => {
    this.playing = !this.playing;
    this.player.play();
  }
}
