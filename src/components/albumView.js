const Album = require('./album');
const Song = require('./song');

function AlbumView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.children = {
    album: null,
    songs: {}
  };
  this.state = {};


  this.render = () => {
    let action = this.action || 'files';
    let album = new Album(data, true);

    this.el.className = 'albumView';

    //Add song child for remote control
    this.children.album = album;

    this.el.appendChild(album.render());

    for (let _song of this.data.songs) {
      let song = new Song(_song, 'albumView');

      //Add file child to app.songView for remote control
      this.children.songs[_song.id] = song;

      this.el.appendChild(song.render());
    }

    return this.el;
  }
}

module.exports = AlbumView;
