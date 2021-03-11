const Song = require('./song');
const SongViewMain = require('./songViewMain');

function SongView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.children = {
    song: null,
    files: {}
  };

  this.render = async () => {
    try {
      //Create elements
      let action = this.action || 'files';
      let song = new Song(data, 'songView');
      let main = new SongViewMain(data, action);

      //Add classes for styling
      this.el.className = this.action === 'comments' ? 'song-view-comments' : 'song-view-files';

      //Add song child for remote control
      this.children.song = song;

      this.el.appendChild(await song.render());
      this.el.appendChild(main.render());

      app.content.appendChild(this.el);
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = SongView;
