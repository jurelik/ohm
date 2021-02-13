'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./components/nav');
const ExploreView = require('./components/exploreView');
const SongView = require('./components/songView');
const Player = require('./components/player');
const Header = require('./components/header');

const testData = require('./testData');

function App() {
  this.ipfs;
  this.root = document.querySelector('.root');
  this.content = document.querySelector('.content');
  this.nav = new Nav();
  this.player = new Player();
  this.header = new Header();
  this.exploreView = null;
  this.songView = null;

  //State
  this.playing = false;
  this.history = [];
  this.historyIndex = 0;
  this.current = null;

  this.init = () => {
    this.header.render();
    this.nav.render();
    this.player.render();

    //Currently using test data
    this.changeView('explore', testData);
    this.addToHistory('explore', testData);
    this.historyIndex = 0;
    this.header.backButton.className = 'disabled';

    //Init an ipfs daemon & create an ipfs node
    ipcRenderer.on('daemon-ready', async () => {
      this.ipfs = createClient();
    });

    ipcRenderer.send('start');
  }

  this.changeView = (view, data) => {
    this.content.innerHTML = '';

    switch (view) {
      case 'explore':
        this.exploreView = new ExploreView(testData); //TEST DATA - data will be fetched in the future
        return this.exploreView.render();
      case 'song':
        this.songView = new SongView(data.song, data.action);
        return this.content.appendChild(this.songView.render());
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
    });
  }

  this.updatePlayButtons = (id) => {
    this.exploreView.children[id] ? this.exploreView.children[id].handlePlayButtonRemote() : null;
    this.songView.children[id] ? this.songView.children[id].handlePlayButtonRemote() : null;
  }


  this.selectAlbum = (album) => {
    console.log(album);
  }

  this.handlePlayPause = (playing) => {
    this.playing = playing;
  }
}
