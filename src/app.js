'use strict';

const { ipcRenderer } = require('electron');
const { create } = require('ipfs-http-client');
const log = require('./utils/log');
const helpers = require('./utils/helpers');
const { loadingIcon } = require('./utils/svgs');

const Nav = require('./components/nav');
const LoginView = require('./views/loginView');
const ExploreView = require('./views/exploreView');
const FeedView = require('./views/feedView');
const SongView = require('./views/songView');
const AlbumView = require('./views/albumView');
const ArtistView = require('./views/artistView');
const UploadView = require('./views/uploadView');
const SearchView = require('./views/searchView');
const PinnedView = require('./views/pinnedView');
const FollowingView = require('./views/followingView');
const TransfersView = require('./views/transfersView');
const SettingsView = require('./views/settingsView');
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
    following: null,
    transfers: null,
    settings: null
  }
  this.GATEWAY;
  this.OHM_SERVER;
  this.URL;
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
  this.settingsStore = null;
  this.bandwidthController = null;
  this.remoteNode = null; //Is the ipfs node running on an external machine?

  this.login = () => {
    ipcRenderer.once('login', async (e, data) => {
      this.OHM_SERVER = data.OHM_SERVER;
      this.USER_DATA_PATH = data.userDataPath;
      this.URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : `https://${this.OHM_SERVER}${process.env.NODE_ENV === 'test' ? '/test' : ''}`;

      //Create settingsStore
      this.settingsStore = new Store({ name: 'settings' });
      this.settingsStore.init();

      const login = new LoginView();

      try {
        await login.init(); //Attempt login with credentials
      }
      catch (err) {
        if (err.message !== 'FETCH_ERR') log.error(err.message);

        this.root.innerHTML = '' //Draw login screen
        login.render();
      }
    });

    ipcRenderer.send('login');
  }

  this.logout = async (sessionExpired) => {
    try {
      if (!sessionExpired) {
        const _res = await fetch(`${app.URL}/logout`); //Logout server-side

        if (_res.status !== 200) throw new Error('FETCH_ERR');
        const res = await _res.json();
        if (res.type === 'error') throw new Error(res.err);
      }

      this.bandwidthController.abort(); //Abort updateBandwidth
      this.bandwidthController = null;

      this.root.innerHTML = '';
      const login = new LoginView();
      if (!this.remoteNode) await this.ipfs.stop();
      login.render();
    }
    catch (err) {
      if (err.message !== 'FETCH_ERR') log.error(err.message);
    }
  }

  this.init = () => {
    //Init an ipfs daemon & create an ipfs node
    ipcRenderer.once('daemon-ready', async (e, data) => {
      if (!this.remoteNode) log.success('IPFS daemon initiated.');

      try {
        this.ipfs = create({
          protocol: this.settingsStore.getOne('IPFS_API_PROTOCOL'),
          host: this.settingsStore.getOne('IPFS_API_HOST'),
          port: this.settingsStore.getOne('IPFS_API_PORT'),
          apiPath: this.settingsStore.getOne('IPFS_API_PATH'),
        });
        const id = await this.getId(); //Get multiaddress for swarm connections
        this.MULTIADDR = id.addresses[4];
        if (this.remoteNode) log.success('Connection to IPFS daemon established.');

        this.GATEWAY = `${this.settingsStore.getOne('IPFS_API_HOST')}:8080`; //Update gateway

        //Create user folder if it doesn't exist yet
        let initialised = false;
        for await (const file of this.ipfs.files.ls('/')) {
          if (file.name === app.artist) initialised = true;
        }
        if (!initialised) {
          await this.ipfs.files.mkdir(`/${app.artist}/singles`, { parents: true, cidVersion: 1 });
          await this.ipfs.files.mkdir(`/${app.artist}/albums`, { parents: true, cidVersion: 1 });
        }

        //Create transfersStore
        this.transfersStore = new Store({ name: 'transfers' });
        this.transfersStore.init();
        this.initTransfers();

        this.updateBandwidth(); //Start performing ipfs.stat checks for bandwidth

        this.buildHTML(); //Render first content
        this.changeView(data.view);
        this.addToHistory(data.view);
        this.historyIndex = 0;
        this.header.backButton.disabled = true;
      }
      catch (err) {
        if (err.message !== 'FETCH_ERR') log.error(err.message);
      }
    });

    this.remoteNode = this.isNodeRemote(); //Check whether or not ipfs node is remote
    this.remoteNode ? log('Connecting to remote IPFS daemon.') : log('Initiating IPFS daemon..');
    ipcRenderer.on('open-settings', this.openSettings); //Add listener for the open-settings command
    ipcRenderer.on('ipfs-error', this.handleIPFSError);
    ipcRenderer.send('start');
  }

  this.isNodeRemote = () => {
    const host = this.settingsStore.getOne('IPFS_API_HOST');
    const remote = host === 'localhost' || host === '127.0.0.1' ? false : true;

    return remote;
  }

  this.getId = async () => {
    try {
      const id = await this.ipfs.id({ timeout: 10000 });
      const a = id.addresses[4].toString().split('/');
      if (a[3] !== 'tcp') {
        await helpers.timerPromise(1000);
        return await this.getId(); //Check to see if the tcp adress is in the right position and if not, run the same function again
      }
      return id;
    }
    catch (err) {
      throw err;
    }
  }

  this.changeView = async (view, data) => {
    try {
      this.triggerLoading(true); //Trigger loading indicator
      this.current = view;
      this.songs = []; //Clear song references
      this.albums = []; //Clear album references
      this.files = []; //Clear files references
      if (view !== 'search') document.querySelector('.search-input').value = ''; //Reset search-input
      if (!this.nav.names.includes(view)) this.nav.unselect(); //Unselect the current navbar item if we are navigating to a view not listed on it

      switch (view) {
        case 'explore':
          this.views.explore = new ExploreView(data);
          await this.views.explore.render();
          break;
        case 'feed':
          this.views.feed = new FeedView(data);
          await this.views.feed.render();
          break;
        case 'song':
          this.views.song = new SongView(data.song, data.action);
          await this.views.song.render();
          break;
        case 'album':
          this.views.album = new AlbumView(data.album);
          await this.views.album.render();
          break;
        case 'artist':
          this.views.artist = new ArtistView(data.artist);
          await this.views.artist.render();
          break;
        case 'upload':
          if (this.views.upload) { this.views.upload.display(); break; }; //Prevent re-render to preserve input state etc.

          this.views.upload = new UploadView();
          this.views.upload.render();
          break;
        case 'search':
          this.views.search = new SearchView(data);
          await this.views.search.render();
          break;
        case 'pinned':
          this.views.pinned = new PinnedView(data);
          await this.views.pinned.render();
          break;
        case 'following':
          this.views.following = new FollowingView(data);
          await this.views.following.render();
          break;
        case 'transfers':
          this.views.transfers = new TransfersView();
          await this.views.transfers.render();
          break;
        case 'settings':
          this.views.settings = new SettingsView();
          this.views.settings.render();
          break;
        default:
          this.content.textContent = 'View not found.';
          break;
      }

      app.content.scrollTop = 0;
      this.triggerLoading(false); //Stop loading indicator
    }
    catch (err) {
      if (err.message !== 'FETCH_ERR') log.error(err.message);
      if (err.message === 'User not authenticated') await this.logout(true);
    }
  }

  this.addToHistory = (type, data) => {
    this.header.backButton.disabled = false;
    this.header.forwardButton.disabled = true;
    this.historyIndex++;

    //Clear all history above current index
    this.history.splice(this.historyIndex);
    this.history.push({ type, data });
  }

  this.removeLastFromHistory = () => {
    this.history.pop(); //Remove current screen from history
    this.historyIndex--; //Move the history index one number back
    if (this.historyIndex === 0) this.header.backButton.disabled = true; //Disable back button if we are on last index
  }

  this.initTransfers = () => {
    const transfers = this.transfersStore.get();
    for (let unique in transfers) transfers[unique].active = false; //All transfers are paused on app open - ADD OPTION TO DISABLE THIS
  }

  this.triggerLoading = (val) => {
    const el = document.querySelector('.loading');
    if (!el) return; //Take care of sessionExpired logout scenario where .loading gets deleted

    val ? el.innerHTML = loadingIcon : el.innerHTML = '';
  }

  this.updateBandwidth = async () => {
    this.bandwidthController = new AbortController();

    try {
      for await (const stats of app.ipfs.stats.bw({ poll: true, interval: '1s', signal: this.bandwidthController.signal })) {
        const dl = helpers.formatBytes(stats.rateIn);
        const ul = helpers.formatBytes(stats.rateOut);

        document.querySelector('.dl').textContent = `dl: ${dl}`;
        document.querySelector('.ul').textContent = `ul: ${ul}`;
      }
    }
    catch (err) {
      if (err.message === 'The user aborted a request.') return;
      log.error(err.message);
    }
  }

  this.openSettings = () => {
    this.addToHistory('settings');
    this.changeView('settings');
  }

  this.handleIPFSError = (e, err) => {
    log.error(`IPFS Error: ${Buffer.from(err)}`);
  }

  this.changePassword = async (_old, _new) => {
    try {
      const _res = await fetch(`${app.URL}/changepassword`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ old: _old, new: _new })
      });

      if (_res.status !== 200) throw new Error('FETCH_ERR');
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      log.success('Password successfully changed.');
      this.logout(true);
    }
    catch (err) {
      if (err.message !== 'FETCH_ERR') log.error(err.message);
    }
  }

  this.changeLocation = async (location) => {
    try {
      const _res = await fetch(`${app.URL}/changelocation`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location })
      });

      if (_res.status !== 200) throw new Error('FETCH_ERR');
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      log.success('Location successfully changed.');
    }
    catch (err) {
      if (err.message !== 'FETCH_ERR') log.error(err.message);
    }
  }

  this.changeBio = async (bio) => {
    try {
      const _res = await fetch(`${app.URL}/changebio`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio })
      });

      if (_res.status !== 200) throw new Error('FETCH_ERR');
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      log.success('Bio successfully changed.');
    }
    catch (err) {
      if (err.message !== 'FETCH_ERR') log.error(err.message);
    }
  }

  this.createArtist = async (artist, pw, secret) => { //Admin function for the time being
    try {
      const payload = JSON.stringify({ artist, pw, secret });

      const _res = await fetch(`${app.URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload
      });

      if (_res.status !== 200) throw new Error('FETCH_ERR');
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      log.success('Successfully created artist.');
    }
    catch (err) {
      if (err.message !== 'FETCH_ERR') log.error(err.message);
    }
  }

  this.buildHTML = () => {
    //Build HTML skeleton
    this.root.innerHTML = `
    ${process.platform === 'darwin' || (process.platform !== 'darwin' && this.settingsStore.getOne('FRAMELESS') === 'true') ?
    `<div class="drag ${process.platform === 'darwin' ? 'darwin' : ''}">
    </div>` : '' }
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
