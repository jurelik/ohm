'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');

const Nav = require('./components/nav');
const ExploreView = require('./components/exploreView');
const SongView = require('./components/songView');
const AlbumView = require('./components/albumView');
const ArtistView = require('./components/artistView');
const UploadView = require('./components/uploadView');
const PinnedView = require('./components/pinnedView');
const TransfersView = require('./components/transfersView');
const Player = require('./components/player');
const Header = require('./components/header');
const Store = require('./components/store');

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
    uploadView: null,
    pinnedView: null,
    transfersView: null
  }
  this.GATEWAY;
  this.URL;
  this.USER_DATA_PATH;
  this.MULTIADDR;

  //State
  this.playing = false;
  this.history = [];
  this.historyIndex = 0;
  this.current = null;
  this.transfersStore = null;

  this.init = () => {
    //Set constants
    if (process.env.NODE_ENV === 'development') {
      this.GATEWAY = 'http://localhost:8080';
      this.URL = 'http://localhost:3000';
    }
    else {
      this.GATEWAY = 'http://localhost:8080';
      this.URL = 'http://18.132.82.84:3000';
    }

    this.header.render();
    this.nav.render();
    this.player.render();

    //Init an ipfs daemon & create an ipfs node
    ipcRenderer.on('daemon-ready', async (e, userDataPath) => {
      try {
        this.ipfs = createClient();
        this.USER_DATA_PATH = userDataPath;
        const id = await this.ipfs.id() //Get multiaddress for swarm connections
        this.MULTIADDR = id.addresses[4];

        //Create user folder if it doesn't exist yet
        let initialised = false;
        for await (const file of this.ipfs.files.ls('/')) {
          if (file.name === 'antik') initialised = true; //For testing purposes
        }
        if (!initialised) {
          await this.ipfs.files.mkdir('/antik/singles', { parents: true });
          await this.ipfs.files.mkdir('/antik/albums', { parents: true });
        }

        //Create transfersStore
        this.transfersStore = new Store({ name: 'transfers' });
        this.transfersStore.init();
        this.initTransfers();

        //Render first content
        this.changeView('explore');
        this.addToHistory('explore');
        this.historyIndex = 0;
        this.header.backButton.className = 'disabled';

      }
      catch (err) {
        console.error(err);
      }
    });

    ipcRenderer.send('start');
  }

  this.changeView = async (view, data) => {
    try {
      this.content.innerHTML = '';
      this.content.scrollTop = 0;
      this.current = view;

      switch (view) {
        case 'explore':
          if (!this.views.exploreView) this.views.exploreView = new ExploreView(); //Prevent unnecessary fetching of data from server
          return await this.views.exploreView.render();
        case 'song':
          this.views.songView = new SongView(data.song, data.action);
          return await this.views.songView.render();
        case 'album':
          this.views.albumView = new AlbumView(data.album);
          return await this.views.albumView.render();
        case 'artist':
          if (!this.views.artistView || this.views.artistView.data !== data.artist) this.views.artistView = new ArtistView(data.artist); //Prevent unnecessary fetching of data from server
          return await this.views.artistView.render();
        case 'upload':
          if (this.views.uploadView) return this.views.uploadView.display(); //Prevent re-render to preserve input state etc.

          this.views.uploadView = new UploadView();
          return this.views.uploadView.render();
        case 'pinned':
          this.views.pinnedView = new PinnedView();
          return await this.views.pinnedView.render();
        case 'transfers':
          this.views.transfersView = new TransfersView();
          return await this.views.transfersView.render();
        default:
          return this.content.innerHTML = view;
      }
    }
    catch (err) {
      console.error(err);
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

  this.initTransfers = () => {
    const transfers = this.transfersStore.get();

    for (let unique in transfers) {
      transfers[unique].active = false; //All transfers are paused on app open - ADD OPTION TO DISABLE THIS
    }
  }
}
