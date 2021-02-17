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

  this.render = () => {
    let action = this.action || 'files';
    let song = new Song(data, 'songView');
    let main = new SongViewMain(data, action);

    //Add song child for remote control
    this.children.song = song;

    this.el.appendChild(song.render());
    this.el.appendChild(main.render());

    return this.el;
  }
}

module.exports = SongView;
