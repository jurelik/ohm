const ipfs = require('../utils/ipfs');

function ActionBarSong(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.pinned = false;

  this.handleCommentsClick = (e) => {
    e.stopPropagation();
    app.addToHistory('song', { song: this.data, action: 'comments' });
    app.changeView('song', { song: this.data, action: 'comments' });
  }

  this.handlePinClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (app.current === 'album') this.pinned ? await ipfs.unpinSong(this.data, app.views.albumView.data.title) : await ipfs.pinSong(this.data, app.views.albumView.data.title);
      else this.pinned ? await ipfs.unpinSong(this.data) : await ipfs.pinSong(this.data);
      this.pinned = !this.pinned;

      //Update pin innerHTML
      this.el.querySelector('.pin').innerHTML = this.pinned ? 'unpin' : 'pin';
      console.log('success');
    }
    catch (err) {
      console.error(err);
    }
  }

  this.checkIfPinned = async () => {
    try {
      if (app.current === 'album') {
        if (await ipfs.artistExists(this.data.artist) === false) return false; //Check if artist folder exists
        if (await ipfs.albumExists(app.views.albumView.data) === false) return false; //Check if album folder exists

        const cid = await ipfs.songInAlbumExists(this.data, app.views.albumView.data.title); //Get song CID
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
