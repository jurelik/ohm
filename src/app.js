'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');

const Nav = require('./components/nav');
const ExploreView = require('./components/exploreView');
const SongView = require('./components/songView');
const AlbumView = require('./components/albumView');
const ArtistView = require('./components/artistView');
const UploadView = require('./components/uploadView');
const Player = require('./components/player');
const Header = require('./components/header');

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
    artistView: null,
    uploadView: null
  }
  this.GATEWAY;
  this.URL;

  //State
  this.playing = false;
  this.history = [];
  this.historyIndex = 0;
  this.current = null;

  this.init = () => {
    //Set constants
    if (process.env.NODE_ENV === 'development') {
      this.GATEWAY = 'http://localhost:8080';
      this.URL = 'http://localhost:3000';
    }
    else {
      //this.GATEWAY = 'http://localhost:8080';
      //this.URL = 'http://localhost:3000';
    }

    this.header.render();
    this.nav.render();
    this.player.render();

    this.changeView('explore');
    this.addToHistory('explore');
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
    this.content.scrollTop = 0;
    this.current = view;

    switch (view) {
      case 'explore':
        if (!this.views.exploreView) this.views.exploreView = new ExploreView(); //Prevent unnecessary fetching of data from server
        return this.views.exploreView.render();
      case 'song':
        this.views.songView = new SongView(data.song, data.action);
        return this.views.songView.render();
      case 'album':
        this.views.albumView = new AlbumView(data.album);
        return this.content.appendChild(this.views.albumView.render());
      case 'artist':
        if (!this.views.artistView || this.views.artistView.data !== data.artist) this.views.artistView = new ArtistView(data.artist); //Prevent unnecessary fetching of data from server
        return this.views.artistView.render();
      case 'upload':
        if (this.views.uploadView) return this.views.uploadView.display(); //Prevent re-render to preserve input state etc.

        this.views.uploadView = new UploadView();
        return this.views.uploadView.render();
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
