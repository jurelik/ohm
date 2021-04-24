const Song = require('./song');
const SongViewMain = require('./songViewMain');

function SongView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.children = {
    song: null,
    files: {},
    main: null
  };

  this.refresh = async () => {
    try {
      const _res = await fetch(`${app.URL}/api/song/${this.data.id}`);
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      //Re-initialize state
      this.data = res.payload;
      this.children = {
        song: null,
        files: {},
        main: null
      }
      app.songs = []; //Remove old song from global app.songs

      await this.render();
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = '' //Reset innerHTML

      //Create elements
      let action = this.action || 'files';
      let song = new Song(this.data, 'song');
      this.children.main = new SongViewMain(this.data, action);

      //Add classes for styling
      this.el.className = `song-view-${this.action}`;

      //Add song child for remote control
      this.children.song = song;

      this.el.appendChild(await song.render());
      this.el.appendChild(this.children.main.render());

      app.content.appendChild(this.el);
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = SongView;
