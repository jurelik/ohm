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
    //Create elements
    let album = new Album(data, true);
    let description = document.createElement('div');

    //Add classes for styling
    this.el.className = 'albumView';
    description.className = 'description';

    //Add song child for remote control
    this.children.album = album;

    //Add attributes and innerHTML
    description.innerHTML = data.description;

    //Build structure
    this.el.appendChild(album.render());
    this.el.appendChild(description);

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
