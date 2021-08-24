'use strict';

const ipfs = require('../utils/ipfs');
const helpers = require('../utils/helpers');
const io = require('../utils/io');
const log = require('../utils/log');
const { pinIcon } = require('../utils/svgs');

function ActionBarAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.pinned = false;

  this.handlePinClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      log('Initiating transfer..');

      if (this.pinned) {
        await ipfs.unpinAlbum(this.data)
        this.removePinIcon();
      }
      else await ipfs.startTransfer(this.data);
    }
    catch (err) {
      log.error(err.message);
    }
  }

  this.handleDownloadClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      log('Initiating transfer..');
      await ipfs.startTransfer(this.data, { download: true });
    }
    catch (err) {
      log.error(err.message);
    }
  }

  this.handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.el.querySelector('.actions-delete')) return; //Ignore if delete dialog already open

    //Create elements
    const container = document.createElement('div');
    const message = document.createElement('p');
    const yes = document.createElement('button');
    const no = document.createElement('button');

    //Add classes for styling
    container.className = 'actions-delete';

    //Add attributes and innerHTML/textContent
    message.textContent = 'are you sure:'
    yes.textContent = 'yes'
    no.textContent = 'no'

    //Build structure
    this.el.appendChild(container);
    container.appendChild(message);
    container.appendChild(yes);
    container.appendChild(no);

    //Add listeners
    yes.onclick = this.handleDeleteYes;
    no.onclick = this.handleDeleteNo;
  }

  this.handleDeleteYes = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      log('Initiating delete..');
      await io.deleteItem(this.data);
      log.success('Album successfully deleted.');

      helpers.removeItem(this.data); //Delete item from current view and app.albums

      if (app.current === 'album') { //Navigate to explore if currently in albumView
        app.removeLastFromHistory();

        if (app.history[app.history.length - 1].type !== 'explore') app.addToHistory('explore'); //Add explore view to history if it wasn't the previous screen
        app.nav.select('explore'); //Select explore on the navbar
        app.changeView('explore');
      }
    }
    catch (err) {
      log.error(err.message);
    }
  }

  this.handleDeleteNo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.el.querySelector('.actions-delete').remove();
  }

  this.appendPinIcon = () => {
    const icon = document.createElement('div');
    icon.className = 'pin-icon';
    icon.innerHTML = pinIcon;
    this.el.querySelector('.actions-inner').appendChild(icon);
  }

  this.removePinIcon = () => {
    this.pinned = false; //Update pin state
    this.el.querySelector('.pin').textContent = 'pin'; //Update .pin element
    this.el.querySelector('.pin-icon').remove(); //Remove pin icon

    //Remove pin icon from songs if in albumView
    if (app.current === 'album') {
      for (const song of app.songs) {
        const actionBar = song.children.actionBar;

        actionBar.pinned = false; //Update pinned state
        actionBar.el.querySelector('.pin').textContent = 'pin'; //Update .pin element
        actionBar.removePinIcon(); //Remove icon
      }
    }
  }

  this.appendDelete = () => {
    let _delete = document.createElement('button');
    _delete.textContent = 'delete';
    this.el.querySelector('.actions-inner').appendChild(_delete);
    _delete.onclick = this.handleDeleteClick;
  }

  this.render = async () => {
    try {
      //Check if album is pinned
      this.pinned = await ipfs.checkIfAlbumIsPinned(this.data);

      //Create elements
      let inner = document.createElement('inner');
      let songs = document.createElement('button');
      let pin = document.createElement('button');
      let download = document.createElement('button');

      //Add classes for styling
      this.el.className = 'actions';
      inner.className = 'actions-inner';
      pin.className = 'pin';

      //Add attributes and innerHTML/textContent
      songs.textContent = `${this.data.songs.length || this.data.songs} songs`;
      pin.textContent = this.pinned ? 'unpin' : 'pin';
      download.textContent = 'download';

      //Build structure
      this.el.appendChild(inner);
      inner.appendChild(songs);
      inner.appendChild(pin);
      inner.appendChild(download);

      if (this.data.artist === app.artist) this.appendDelete(); //Add delete icon if applicable
      if (this.pinned) this.appendPinIcon(); //Add pin icon if applicable

      //Add listeners
      pin.onclick = this.handlePinClick;
      download.onclick = this.handleDownloadClick;

      return this.el;
    }
    catch (err) {
      log.error(err.message);
    }
  }
}

module.exports = ActionBarAlbum;
