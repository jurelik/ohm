const Album = require('./album');
const Song = require('./song');

function AlbumView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.children = {};
  this.state = {};


  this.render = () => {
    let action = this.action || 'files';
    let album = new Album(data, true);

    this.el.className = 'albumView';
    //Add song child for remote control
    //this.children[data.id] = song;

    this.el.appendChild(album.render());

    for (let _song of this.data.songs) {
      console.log(this.data)
      let song = new Song(_song);
      this.el.appendChild(song.render());
    }

    return this.el;
  }
}

module.exports = AlbumView;
