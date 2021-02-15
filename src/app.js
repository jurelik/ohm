'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./components/nav');
const ExploreView = require('./components/exploreView');
const SongView = require('./components/songView');
const AlbumView = require('./components/albumView');
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
  this.albumView = null;

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
      case 'album':
        this.albumView = new AlbumView(data.album);
        return this.content.appendChild(this.albumView.render());
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

  this.updatePlayButtons = (id, type) => {
    if (type === 'song') {
      this.exploreView.children.songs[id] ? this.exploreView.children.songs[id].handlePlayButtonRemote() : null;
      this.songView && this.songView.children.song.data.id === id ? this.songView.children.song.handlePlayButtonRemote() : null;
      if (this.albumView && this.albumView.children.songs[id]) {
        this.albumView.children.songs[id].handlePlayButtonRemote()
      }
    }
    else if (type === 'original' || type === 'internal' || type === 'external') {
      this.songView && this.songView.children.files[id] ? this.songView.children.files[id].handlePlayButtonRemote() : null;
    }
    else if (type === 'album') {
      this.exploreView.children.albums[id] ? this.exploreView.children.albums[id].handlePlayButtonRemote() : null;
      this.albumView && this.albumView.children.album.data.id === id ? this.albumView.children.album.handlePlayButtonRemote() : null;
    }
  }

  this.handlePlayPause = (playing) => {
    this.playing = playing;
  }
}
