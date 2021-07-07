const Artist = require('./artist');
const helpers = require('../utils/helpers');

function FollowingView(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.fetch = async () => {
    try {
      const _res = await fetch(`${app.URL}/api/following`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ loadMore: false })
      });
      const res = await _res.json();

      if (res.type === 'error') throw res.err;

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

      this.data = this.data.concat(res.payload); //Append to this.data
      app.history[app.historyIndex].data = this.data; //Modify history
      await this.append(res.payload); //Append to DOM
    }
    catch (err) {
      log.error(err);
    }
  }

  this.append = async (data) => {
    try {
      for (let item of data) {
        let el;
        let artist = new Artist(item, 'search');
        el = artist.render();
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
      console.log(this.data)
      if (this.data.length === 0) return helpers.handleEmpty(this.el); //Show different view if no items to be shown

      for (let item of this.data) {
        let el;
        let artist = new Artist(item, 'search');
        el = artist.render();

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
      throw err;
    }
  }
}

module.exports = FollowingView;
