'use strict';

const { ipcRenderer } = require('electron');
const { create } = require('ipfs-http-client');
const log = require('./utils/log');
const helpers = require('./utils/helpers');
const { loadingIconSmall } = require('./utils/svgs');

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
  this.GATEWAY ='localhost:8080';
  this.URL = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'http://3.10.107.49:3000';
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

  this.logout = async (sessionExpired) => {
    try {
      if (!sessionExpired) {
        const _res = await fetch(`${app.URL}/api/logout`); //Logout server-side
        const res = await _res.json();
        if (res.type === 'error') throw new Error(res.err);
      }

      this.bandwidthController.abort(); //Abort updateBandwidth
      this.bandwidthController = null;

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
        this.USER_DATA_PATH = userDataPath;

        //Create settingsStore
        this.settingsStore = new Store({ name: 'settings' });
        this.settingsStore.init();

        this.ipfs = create({
          protocol: this.settingsStore.getOne('IPFS_PROTOCOL'),
          host: this.settingsStore.getOne('IPFS_HOST'),
          port: this.settingsStore.getOne('IPFS_PORT'),
          apiPath: this.settingsStore.getOne('IPFS_PATH'),
        });
        const id = await this.getId(); //Get multiaddress for swarm connections
        this.MULTIADDR = id.addresses[4];

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
        this.changeView('explore');
        this.addToHistory('explore');
        this.historyIndex = 0;
        this.header.backButton.disabled = true;
      }
      catch (err) {
        log.error(err);
      }
    });

    log('Initiating IPFS daemon..');
    ipcRenderer.on('open-settings', this.openSettings); //Add listener for the open-settings command
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
          this.content.textContent = 'view not found';
          break;
      }

      this.triggerLoading(false); //Stop loading indicator
    }
    catch (err) {
      log.error(err);
      if (err === 'User not authenticated') await this.logout(true);
    }
  }

  this.addToHistory = (type, data) => {
    this.header.backButton.disabled = false;
    this.header.forwardButton.disabled = true;
    this.historyIndex++;

    //Clear all history above current index
    this.history.splice(this.historyIndex);

    this.history.push({
      type,
      data
    });
  }

  this.removeLastFromHistory = () => {
    this.history.pop(); //Remove current screen from history
    this.historyIndex--; //Move the history index one number back
    if (this.historyIndex === 0) this.header.backButton.disabled = true; //Disable back button if we are on last index
  }

  this.initTransfers = () => {
    const transfers = this.transfersStore.get();

    for (let unique in transfers) {
      transfers[unique].active = false; //All transfers are paused on app open - ADD OPTION TO DISABLE THIS
    }
  }

  this.triggerLoading = (val) => {
    const el = document.querySelector('.loading');
    if (!el) return; //Take care of sessionExpired logout scenario where .loading gets deleted

    val ? el.innerHTML = loadingIconSmall : el.innerHTML = '';
  }

  this.updateBandwidth = async () => {
    this.bandwidthController = new AbortController();

    try {
      for await (const stats of app.ipfs.stats.bw({ poll: true, interval: '1s', signal: this.bandwidthController })) {
        const dl = helpers.formatBytes(parseInt(stats.rateIn));
        const ul = helpers.formatBytes(parseInt(stats.rateOut));

        document.querySelector('.dl').textContent = `dl: ${dl}`;
        document.querySelector('.ul').textContent = `ul: ${ul}`;
      }
    }
    catch (err) {
      if (err.message === 'The user aborted a request.') return;
      log.error(err)
    }
  }

  this.openSettings = () => {
    this.addToHistory('settings');
    this.changeView('settings');
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

  this.changeLocation = async (location) => {
    try {
      const _res = await fetch(`${app.URL}/api/changelocation`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ location })
      });

      const res = await _res.json();
      if (res.type === 'error') throw res.err;

      log.success('Location successfully changed.');
    }
    catch (err) {
      log.error(err);
    }
  }

  this.changeBio = async (bio) => {
    try {
      const _res = await fetch(`${app.URL}/api/changebio`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bio })
      });

      const res = await _res.json();
      if (res.type === 'error') throw res.err;

      log.success('Bio successfully changed.');
    }
    catch (err) {
      log.error(err);
    }
  }

  this.buildHTML = () => {
    //Build HTML skeleton
    this.root.innerHTML = `
    <div class="drag">
      <div class="bw">
        <div class="dl">
        </div>
        <div class="ul">
        </div>
      </div>
      <div class="loading">
      </div>
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
