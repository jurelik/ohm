const Song = require('./song');

function SongView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.state = {};

  this.render = () => {
    let action = this.action || 'files';
    let song = new Song(data.song, true);

    this.el.appendChild(song.render());

    return this.el;
  }
}

module.exports = SongView;
