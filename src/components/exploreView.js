const Song = require('./song');
const Album = require('./album');
const log = require('../utils/log');

function ExploreView() {
  this.el = document.createElement('div');
  this.data = null;

  this.fetch = async () => {
    try {
      //const _res = await fetch(`${app.URL}/api/latest`);
      const _res = await fetch(`${app.URL}/api/latest`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loadMore: false })
      });
      const res = await _res.json();

      if (res.type === 'error') throw res.err;

      return res.payload;
    }
    catch (err) {
      throw err;
    }
  }

  this.handleLoadMore = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      //const _res = await fetch(`${app.URL}/api/latest`);
      const _res = await fetch(`${app.URL}/api/latest`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loadMore: true,
          lastItem: this.data[this.data.length - 1]
        })
      });
      const res = await _res.json();

      if (res.type === 'error') throw res.err;

      this.data = this.data.concat(res.payload);
      await this.render();
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
      console.error(err);
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML

      //Fetch data from server on first render
      if (!this.data) this.data = await this.fetch();

      for (let item of this.data) {
        let el;
        if (item.type === 'song') {
          let song = new Song(item, 'explore');
          el = await song.render();
        }
        else if (item.type === 'album') {
          let album = new Album(item, 'explore');
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
      loadMore.onclick = this.handleLoadMore;
      this.el.appendChild(loadMore);

      app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = ExploreView;
