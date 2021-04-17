const Song = require('./song');
const Album = require('./album');

function ExploreView() {
  this.el = document.createElement('div');
  this.data = null;
  this.children = {
    songs: {},
    albums: {}
  };

  this.fetch = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const _res = await fetch(`${app.URL}/api/latest`);
        const res = await _res.json();

        if (res.type === 'error') return reject(res.err);

        resolve(res.payload);
      }
      catch (err) {
        reject(err);
      }
    });
  }

  this.removeItem = (data) => {
    if (data.type === 'song') {
      const children = this.children.songs
      for (let song in children) {
        if (song === data.id.toString()) {
          children[song].el.remove();
          delete children[song];
          for (let item of this.data) {
            if (item.type === 'song' && item.id.toString() === song) {
              this.data.splice(this.data.indexOf(item), 1);
            }
          }
        }
      }
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML

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

module.exports = ExploreView;
