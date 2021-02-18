'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const fetch = require('node-fetch');

const Nav = require('./components/nav');
const ExploreView = require('./components/exploreView');
const SongView = require('./components/songView');
const AlbumView = require('./components/albumView');
const ArtistView = require('./components/artistView');
const Player = require('./components/player');
const Header = require('./components/header');

const { testData } = require('./testData');

function App() {
  this.ipfs;
  this.root = document.querySelector('.root');
  this.content = document.querySelector('.content');
  this.nav = new Nav();
  this.player = new Player();
  this.header = new Header();
  this.views = {
    exploreView: null,
    songView: null,
    albumView: null,
    artistView: null
  }

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
        this.views.exploreView = new ExploreView(testData); //TEST DATA - data will be fetched in the future
        return this.views.exploreView.render();
      case 'song':
        this.views.songView = new SongView(data.song, data.action);
        return this.content.appendChild(this.views.songView.render());
      case 'album':
        this.views.albumView = new AlbumView(data.album);
        return this.content.appendChild(this.views.albumView.render());
      case 'artist':
        this.views.artistView = new ArtistView(data.artist);
        return this.content.appendChild(this.views.artistView.render());
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
}
