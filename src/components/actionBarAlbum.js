const ipfs = require('../utils/ipfs');

function ActionBarAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

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
      //Create elements
      let songs = document.createElement('button');
      let pin = document.createElement('button');
      let download = document.createElement('button');

      //Add classes for styling
      this.el.className = 'actions';

      //Add attributes and innerHTML
      songs.innerHTML = `${this.data.songs.length} songs`;
      pin.innerHTML = await this.checkIfPinned() ? 'pinned' : 'pin';
      download.innerHTML = 'download all';

      //Build structure
      this.el.appendChild(songs);
      this.el.appendChild(pin);
      this.el.appendChild(download);

      //Add listeners
      pin.onclick = (e) => {
        e.stopPropagation();
      }

      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = ActionBarAlbum;
