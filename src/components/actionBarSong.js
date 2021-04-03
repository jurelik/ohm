const ipfs = require('../utils/ipfs');
const log = require('../utils/log');
const helpers = require('../utils/helpers');

function ActionBarSong(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.pinned = false;

  this.pinIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="598.5 258.5 183 183"><path fill="none" stroke="#BBB" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M720 350h0v30l45-45-45-45v30h-30m-30 30h0v-30l-45 45 45 45v-30h30m-30-30h60"/><path fill="none" d="M598.5 258.5h183v183h-183v-183z"/></svg></svg>'

  this.handleCommentsClick = (e) => {
    e.stopPropagation();
    app.addToHistory('song', { song: this.data, action: 'comments' });
    app.changeView('song', { song: this.data, action: 'comments' });
  }

  this.handlePinClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      log('Initiating transfer..');
      if (this.pinned) {
        await ipfs.unpinSong(this.data);
        this.removePinIcon();
      }
      else await ipfs.pinSong(this.data);
    }
    catch (err) {
      log.error(err);
    }
  }

  this.handleDownloadClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      log('Initiating transfer..');
      await ipfs.downloadSong(this.data);
    }
    catch (err) {
      log.error(err);
    }
  }

  this.appendPinIcon = () => {
    const icon = document.createElement('div');
    icon.className = 'pin-icon';
    icon.innerHTML = this.pinIcon;
    this.el.appendChild(icon);
  }

  this.removePinIcon = () => {
    this.pinned = false; //Update pinned state
    this.el.querySelector('.pin-icon').remove(); //Remove pin icon
    this.el.querySelector('.pin').innerHTML = 'pin' //Update pin

    //Update album pin state if applicable
    if (this.data.albumTitle && app.current === 'album') {
      const actionBar = app.albums[0].children.actionBar;
      if (!actionBar.pinned) return;

      actionBar.pinned = false; //Update pinned state
      actionBar.el.querySelector('.pin-icon').remove(); //Remove pin icon
      actionBar.el.querySelector('.pin').innerHTML = 'pin' //Update pin
    }
  }

  this.checkIfPinned = async () => {
    try {
      if (this.data.albumTitle) {
        if (await ipfs.artistExists(this.data.artist) === false) return false; //Check if artist folder exists
        if (await ipfs.albumExists(this.data) === false) return false; //Check if album folder exists

        const cid = await ipfs.songInAlbumExists(this.data, this.data.albumTitle); //Get song CID
        if (!cid || cid !== this.data.cid) return false; //Check if CID matches
      }
      else {
        if (await ipfs.artistExists(this.data.artist) === false) return false; //Check if artist folder exists

        const cid = await ipfs.songExists(this.data); //Get song CID
        if (!cid || cid !== this.data.cid) return false; //Check if CID matches
      }
      return true;
    }
    catch (err) {
      console.error(err)
    }
  }

  this.render = async () => {
    try {
      this.pinned = await this.checkIfPinned(); //Check if song is pinned

      //Create elements
      let files = document.createElement('button');
      let comments = document.createElement('button');
      let pin = document.createElement('button');
      let download = document.createElement('button');

      //Add classes for styling
      this.el.className = 'actions';
      pin.className = 'pin';

      //Add attributes and innerHTML
      files.innerHTML = `${this.data.files.length} files`;
      comments.innerHTML = `${this.data.comments.length} comments`;
      pin.innerHTML = this.pinned ? 'unpin' : 'pin';
      download.innerHTML = 'download';

      //Build structure
      this.el.appendChild(files);
      this.el.appendChild(comments);
      this.el.appendChild(pin);
      this.el.appendChild(download);

      //Add pin icon if applicable
      if (this.pinned) this.appendPinIcon();

      //Add listeners
      comments.onclick = this.handleCommentsClick;
      pin.onclick = this.handlePinClick;
      download.onclick = this.handleDownloadClick;

      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = ActionBarSong;
