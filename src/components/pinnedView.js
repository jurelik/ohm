const ipfs = require('../utils/ipfs');
const log = require('../utils/log');
const Album = require('./album');
const Song = require('./song');

function PinnedView(data) {
  this.el = document.createElement('div');
  this.data = null;

  this.init = async () => {
    try {
      const payload = await ipfs.getPinned();

      const _res = await fetch(`${app.URL}/api/pinned`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const res = await _res.json();
      if (res.type === 'error') throw res.err;

      return res.payload;
    }
    catch (err) {
      log.error(err);
    }
  }

  this.refresh = async () => {
    try {
      this.data = null;
      await this.render();
    }
    catch (err) {
      log.error(err);
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML
      if (!this.data) this.data = await this.init(); //Get data

      //Create elements

      //Add classes for styling
      this.el.className = 'pinned-view';
      //Add attributes and innerHTML

      for (let item of this.data) {
        let el;
        if (item.type === 'song') {
          let song = new Song(item, 'pinned');
          el = await song.render();
        }
        else if (item.type === 'album') {
          let album = new Album(item, 'pinned');
          el = await album.render();
        }
        else {
          continue;
        }
        this.el.appendChild(el);
      }

      //Add load more button
      const loadMore = document.createElement('button');
      loadMore.innerHTML = 'load more..';
      loadMore.className = 'load-more';
      loadMore.onclick = this.handleLoadMore;
      this.el.appendChild(loadMore);

      app.content.appendChild(this.el);
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = PinnedView;
