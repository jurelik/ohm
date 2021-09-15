'use strict';

const Song = require('../components/song');
const Album = require('../components/album');
const log = require('../utils/log');
const helpers = require('../utils/helpers');

function ExploreView(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.fetch = async () => {
    try {
      const _res = await fetch(`${app.URL}/latest`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loadMore: false })
      });

      if (_res.status !== 200) throw new Error('FETCH_ERR');
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      app.history[app.historyIndex].data = res.payload; //Add data to history
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
      app.triggerLoading(true); //Trigger loading indicator
      const _res = await fetch(`${app.URL}/latest`, {
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

      if (_res.status !== 200) throw new Error('FETCH_ERR');
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      this.data = this.data.concat(res.payload); //Append to this.data
      app.history[app.historyIndex].data = this.data; //Modify history
      await this.append(res.payload); //Append to DOM
      app.triggerLoading(false); //Trigger loading indicator
    }
    catch (err) {
      if (err.message !== 'FETCH_ERR') log.error(err.message);
      app.triggerLoading(false); //Trigger loading indicator
    }
  }

  this.refresh = async () => {
    try {
      this.data = null;
      await this.render();
    }
    catch (err) {
      throw err;
    }
  }

  this.append = async (data) => {
    try {
      for (let item of data) {
        let el;
        if (item.type === 'song') {
          let song = new Song(item, 'explore');
          el = await song.render();
        }
        else if (item.type === 'album') {
          let album = new Album(item, 'explore');
          el = await album.render();
        }
        else continue;
        this.el.insertBefore(el, this.el.querySelector('.load-more'));
      }
    }
    catch (err) {
      throw err;
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML

      if (!this.data) this.data = await this.fetch(); //Fetch data from server on first render
      if (this.data.length === 0) return helpers.handleEmpty(this.el); //Show different view if no items to be shown

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
        else continue;
        this.el.appendChild(el);
      }

      //Add load more button
      const loadMore = document.createElement('button');
      loadMore.textContent = 'load more..';
      loadMore.className = 'load-more';
      loadMore.onclick = this.handleLoadMore;
      this.el.appendChild(loadMore);

      app.content.innerHTML = '';
      app.content.appendChild(this.el);
    }
    catch (err) {
      throw err;
    }
  }
}

module.exports = ExploreView;
