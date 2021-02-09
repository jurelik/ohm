const { createSongViewElement } = require('./utils/components');
function SongView() {
  this.song = null;

  this.render = (song) => {
    this.song = song;
    let el;
    el = createSongViewElement(song);
    client.content.appendChild(el);
  }
}

module.exports = SongView;
