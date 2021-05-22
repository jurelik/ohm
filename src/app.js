'use strict'

const { ipcRenderer } = require('electron');
const createClient = require('ipfs-http-client');
const log = require('./utils/log');

const Nav = require('./components/nav');
const LoginView = require('./components/loginView');
const ExploreView = require('./components/exploreView');
const FeedView = require('./components/feedView');
const SongView = require('./components/songView');
const AlbumView = require('./components/albumView');
const ArtistView = require('./components/artistView');
const UploadView = require('./components/uploadView');
const SearchView = require('./components/searchView');
const PinnedView = require('./components/pinnedView');
const TransfersView = require('./components/transfersView');
const Player = require('./components/player');
const Header = require('./components/header');
const Store = require('./components/store');

function App() {
  this.ipfs;
  this.root = document.querySelector('.root');
  this.content;
  this.nav;
  this.player;
  this.header;
  this.views = {
    explore: null,
    feed: null,
    song: null,
    album: null,
    artist: null,
    upload: null,
    search: null,
    pinned: null,
    transfers: null
  }
  this.GATEWAY ='http://localhost:8080';
  this.URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://18.132.82.84:3000';
  this.USER_DATA_PATH;
  this.MULTIADDR;

  //State
  this.artist;
  this.playing = false;
  this.history = [];
  this.historyIndex = 0;
  this.current = null;
  this.songs = [];
  this.albums = [];
  this.files = [];
  this.transfersStore = null;

  this.login = async () => {
    const login = new LoginView();

    try {
      await login.init(); //Attempt login with credentials
    }
    catch (err) {
      log.error(err);

      this.root.innerHTML = '' //Draw login screen
      login.render();
    }
  }

  this.logout = async () => {
    try {
      const _res = await fetch(`${app.URL}/api/logout`); //Logout server-side
      const res = await _res.json();
      if (res.type === 'error') throw new Error(err);

      this.root.innerHTML = '';
      const login = new LoginView();
      await this.ipfs.stop();
      login.render();
    }
    catch (err) {
      log.error(err);
    }
  }

  this.init = () => {
    //Init an ipfs daemon & create an ipfs node
    ipcRenderer.once('daemon-ready', async (e, userDataPath) => {
      log.success('IPFS daemon initiated.');
      try {
        this.ipfs = createClient({
          headers: {
            "Clear-Site-Data": ""
          }
        });
        this.USER_DATA_PATH = userDataPath;
        const id = await this.getId(); //Get multiaddress for swarm connections
        this.MULTIADDR = id.addresses[4];

        //Create user folder if it doesn't exist yet
        let initialised = false;
        for await (const file of this.ipfs.files.ls('/')) {
          if (file.name === app.artist) initialised = true;
        }
        if (!initialised) {
          await this.ipfs.files.mkdir(`/${app.artist}/singles`, { parents: true });
          await this.ipfs.files.mkdir(`/${app.artist}/albums`, { parents: true });
        }

        //Create transfersStore
        this.transfersStore = new Store({ name: 'transfers' });
        this.transfersStore.init();
        this.initTransfers();

        this.buildHTML(); //Render first content
        this.changeView('explore');
        this.addToHistory('explore');
        this.historyIndex = 0;
        this.header.backButton.className = 'disabled';
      }
      catch (err) {
        log.error(err);
      }
    });

    log('Initiating IPFS daemon..');
    ipcRenderer.send('start');
  }

  this.getId = async () => {
    try {
      const id = await this.ipfs.id();
      const a = id.addresses[4].toString().split('/');
      if (a[3] !== 'tcp') return await this.getId(); //Check to see if the tcp adress is in the right position and if not, run the same function again
      return id;
    }
    catch (err) {
      throw err;
    }
  }

  this.changeView = async (view, data) => {
    try {
      this.content.innerHTML = '';
      this.content.scrollTop = 0;
      this.current = view;
      this.songs = []; //Clear song references
      this.albums = []; //Clear album references
      this.files = []; //Clear files references
      document.querySelector('.search-input').value = ''; //Reset search-input

      switch (view) {
        case 'explore':
          this.views.explore = new ExploreView();
          return await this.views.explore.render();
        case 'feed':
          this.views.feed = new FeedView();
          return await this.views.feed.render();
        case 'song':
          this.views.song = new SongView(data.song, data.action);
          return await this.views.song.render();
        case 'album':
          this.views.album = new AlbumView(data.album);
          return await this.views.album.render();
        case 'artist':
          this.views.artist = new ArtistView(data.artist);
          return await this.views.artist.render();
        case 'upload':
          if (this.views.upload) return this.views.upload.display(); //Prevent re-render to preserve input state etc.

          this.views.upload = new UploadView();
          return this.views.upload.render();
        case 'search':
          this.views.search = new SearchView(data);
          return await this.views.search.render();
        case 'pinned':
          this.views.pinned = new PinnedView();
          return await this.views.pinned.render();
        case 'transfers':
          this.views.transfers = new TransfersView();
          return await this.views.transfers.render();
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

  this.removeLastFromHistory = () => {
    app.history.pop(); //Remove current screen from history
    app.historyIndex--; //Move the history index one number back
    if (app.historyIndex === 0) app.header.backButton.className = 'disabled'; //Disable back button if we are on last index
  }

  this.initTransfers = () => {
    const transfers = this.transfersStore.get();

    for (let unique in transfers) {
      transfers[unique].active = false; //All transfers are paused on app open - ADD OPTION TO DISABLE THIS
    }
  }

  this.changePassword = async (_old, _new) => {
    try {
      const _res = await fetch(`${app.URL}/api/changepassword`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old: _old, new: _new })
      });

      const res = await _res.json();
      if (res.type === 'error') throw res.err;

      log.success('Password successfully changed.');
      this.logout();
    }
    catch (err) {
      log.error(err);
    }
  }

  this.buildHTML = () => {
    //Build HTML skeleton
    this.root.innerHTML = `
    <div class="drag">
    </div>
    <div class="header">
    </div>
    <div class="main">
      <div class="nav">
      </div>
      <div class="content">
      </div>
    </div>
    <div class="player">
    </div>
    <audio></audio>`

    //Initialise main blocks
    this.content = document.querySelector('.content');
    this.nav = new Nav();
    this.player = new Player();
    this.header = new Header();
    this.header.render();
    this.nav.render();
    this.player.render();
  }
}
