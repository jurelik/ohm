//const { createAlbumElement } = require('./utils/components');
const Song = require('./song');
const Album = require('./album');

function ExploreView() {
  this.el = document.createElement('div');
  this.data = null;
  this.children = {
    songs: {},
    albums: {}
  };
  this.state = {};

  this.fetch = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const _res = await fetch('http://localhost:3000/api/latest');
        const res = await _res.json();

        resolve(res);
      }
      catch (err) {
        reject(err);
      }
    });
  }

  this.render = async () => {
    try {
      //Fetch data from server on first render
      if (!this.data) {
        this.data = await this.fetch();
      }

      this.children = {
        songs: {},
        albums: {}
      };

      for (let item of this.data) {
        let el;
        if (item.type === 'song') {
          let song = new Song(item);
          this.children.songs[item.id] = song;
          el = song.render();
        }
        else if (item.type === 'album') {
          let album = new Album(item);
          this.children.albums[item.id] = album;
          el = album.render();
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

module.exports = ExploreView;
