const Song = require('./song');
const SongViewMain = require('./songViewMain');

function SongView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.state = {};

  this.render = () => {
    let action = this.action || 'files';
    let song = new Song(data, true);
    let main = new SongViewMain(data, action);

    this.el.appendChild(song.render());
    this.el.appendChild(main.render());

    return this.el;
  }
}

module.exports = SongView;
