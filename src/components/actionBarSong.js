const ipfs = require('../utils/ipfs');

function ActionBarSong(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.handleCommentsClick = (e) => {
    e.stopPropagation();
    app.addToHistory('song', { song: this.data, action: 'comments' });
    app.changeView('song', { song: this.data, action: 'comments' });
  }

  this.handlePinClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
    }
    catch (err) {
      console.error(err);
    }
  }

  this.checkIfPinned = async () => {
    try {
      //Check if artist folder exists
      if (await ipfs.checkIfArtistExists(this.data.artist) === false) return false;
      if (await ipfs.checkIfSongExists(this.data) === false) return false;
      return true;
    }
    catch (err) {
      console.error(err)
    }
  }

  this.render = async () => {
    try {
      //Create elements
      let files = document.createElement('button');
      let comments = document.createElement('button');
      let pin = document.createElement('button');
      let download = document.createElement('button');

      //Add classes for styling
      this.el.className = 'actions';

      //Add attributes and innerHTML
      files.innerHTML = `${this.data.files.length} files`;
      comments.innerHTML = `${this.data.comments.length} comments`;
      pin.innerHTML = await this.checkIfPinned() ? 'pinned' : 'pin';
      download.innerHTML = 'download all';

      //Build structure
      this.el.appendChild(files);
      this.el.appendChild(comments);
      this.el.appendChild(pin);
      this.el.appendChild(download);

      //Add listeners
      comments.onclick = this.handleCommentsClick;
      pin.onclick = this.handlePinClick;

      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = ActionBarSong;
