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
      let song = new Song(data, 'song');
      this.children.main = new SongViewMain(data, action);

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
