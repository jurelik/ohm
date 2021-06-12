const ipfs = require('../utils/ipfs');
const log = require('../utils/log');
const Album = require('./album');
const Song = require('./song');

function PinnedView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.LOAD_MORE_AMOUNT = 2;

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

      const data = { items: res.payload, amountShown: this.LOAD_MORE_AMOUNT };
      app.history[app.historyIndex].data = data; //Modify history
      return data;
    }
    catch (err) {
      log.error(err);
    }
  }

  this.handleLoadMore = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      if (this.data.amountShown + this.LOAD_MORE_AMOUNT > this.data.items.length) throw new Error('Last item reached.');

      this.data.amountShown += this.LOAD_MORE_AMOUNT; //Append amount of items shown
      app.history[app.historyIndex].data.amountShown = this.data.amountShown; //Modify history
      await this.append(); //Append to DOM
    }
    catch (err) {
      log.error(err.message);
    }
  }

  this.handleEmpty = () => {
    const el = document.createElement('div');
    el.innerHTML = 'No items found.';

    app.content.innerHTML = '';
    this.el.appendChild(el);
    return app.content.appendChild(this.el);
  }

  this.append = async () => {
    try {
      for (let i = this.data.amountShown - this.LOAD_MORE_AMOUNT; i < this.data.amountShown; i++) {
        let el;
        let item = this.data.items[i];

        if (item.type === 'song') {
          let song = new Song(item, 'feed');
          el = await song.render();
        }
        else if (item.type === 'album') {
          let album = new Album(item, 'feed');
          el = await album.render();
        }
        else {
          continue;
        }
        this.el.insertBefore(el, this.el.querySelector('.load-more'));
      }
    }
    catch (err) {
      throw err;
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
      if (this.data.items.length === 0) return this.handleEmpty(); //Show different view if no items to be shown

      //Create elements

      //Add classes for styling
      this.el.className = 'pinned-view';

      //Add attributes and innerHTML

      for (let i = 0; i < this.data.amountShown; i++) {
        if (!this.data.items[i]) break; //Handle scenario when less items shown than this.LOAD_MORE_AMOUNT

        let item = this.data.items[i];
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

      app.content.innerHTML = '';
      app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = PinnedView;
