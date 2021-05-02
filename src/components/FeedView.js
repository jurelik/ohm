const Song = require('./song');
const Album = require('./album');
const helpers = require('../utils/helpers');

function FeedView(data) {
  this.el = document.createElement('div');
  this.data = null;
  this.children = {
    songs: {},
    albums: {}
  };

  this.fetch = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const _res = await fetch(`${app.URL}/api/feed`);
        const res = await _res.json();

        if (res.type === 'error') return reject(res.err);

        resolve(res.payload);
      }
      catch (err) {
        reject(err);
      }
    });
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

      this.children = {
        songs: {},
        albums: {}
      };

      for (let item of this.data) {
        let el;
        if (item.type === 'song') {
          let song = new Song(item);
          this.children.songs[item.id] = song;
          el = await song.render();
        }
        else if (item.type === 'album') {
          let album = new Album(item);
          this.children.albums[item.id] = album;
          el = await album.render();
        }
        else {
          continue;
        }
        this.el.appendChild(el);
      }

      app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = FeedView;
