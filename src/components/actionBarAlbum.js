const ipfs = require('../utils/ipfs');
const log = require('../utils/log');

function ActionBarAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.pinned = false;

  this.handlePinClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      log('Initiating transfer..');
      this.pinned ? await ipfs.unpinAlbum(this.data) : await ipfs.pinAlbum(this.data);
      this.pinned = !this.pinned;

      //Update pin innerHTML
      this.el.querySelector('.pin').innerHTML = this.pinned ? 'unpin' : 'pin';

      //If in albumView, update all song pins as well
      if (app.current === 'album') {
        let songs = app.views.albumView.children.songs;
        for (let key in songs) {
          songs[key].children.actionBar.pinned = this.pinned;
          songs[key].el.querySelector('.pin').innerHTML = this.pinned ? 'unpin' : 'pin';
        }
      }

      log.success(`Album ${this.pinned ? 'pinned' : 'unpinned'}`);
    }
    catch (err) {
      console.error(err);
    }
  }

  this.checkIfPinned = async () => {
    try {
      if (await ipfs.artistExists(this.data.artist) === false) return false; //Check if artist folder exists
      const cid = await ipfs.albumExists(this.data) //Get CID
      if (!cid || cid !== this.data.cid) return false; //Check if CID matches

      return true;
    }
    catch (err) {
      console.error(err)
    }
  }

  this.render = async () => {
    try {
      //Check if album is pinned
      this.pinned = await this.checkIfPinned();

      //Create elements
      let songs = document.createElement('button');
      let pin = document.createElement('button');
      let download = document.createElement('button');

      //Add classes for styling
      this.el.className = 'actions';
      pin.className = 'pin';

      //Add attributes and innerHTML
      songs.innerHTML = `${this.data.songs.length} songs`;
      pin.innerHTML = this.pinned ? 'unpin' : 'pin';
      download.innerHTML = 'download all';

      //Build structure
      this.el.appendChild(songs);
      this.el.appendChild(pin);
      this.el.appendChild(download);

      //Add listeners
      pin.onclick = this.handlePinClick;

      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = ActionBarAlbum;
