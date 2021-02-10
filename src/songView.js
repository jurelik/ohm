const { createSongViewElement } = require('./utils/components');

function SongView() {
  this.song = null;
  this.action = null

  this.render = (data) => {
    this.song = data.song;
    this.action = data.action;

    let songViewEl = createSongViewElement(data.song, data.action);
    client.content.appendChild(songViewEl);
  }
}

module.exports = SongView;
