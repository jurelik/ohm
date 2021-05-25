const Song = require('./song');
const Album = require('./album');

function ExploreView() {
  this.el = document.createElement('div');
  this.data = null;

  this.fetch = async () => {
    try {
      const _res = await fetch(`${app.URL}/api/latest`);
      const res = await _res.json();

      if (res.type === 'error') throw res.err;

      return res.payload;
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

      app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = ExploreView;
