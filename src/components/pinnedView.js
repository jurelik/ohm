const ipfs = require('../utils/ipfs');
const Album = require('./album');
const Song = require('./song');

function PinnedView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {
    songs: {},
    albums: {}
  };

  this.render = async () => {
    try {
      //Get data
      this.data = await ipfs.getPinned();

      //Create elements
      let albums = document.createElement('p');
      let songs = document.createElement('p');

      //Add classes for styling
      this.el.className = 'pinned-view';

      //Add attributes and innerHTML
      albums.innerHTML = 'albums:';
      songs.innerHTML = 'songs:';

      //Add albums
      this.el.appendChild(albums);
      for (let _album of this.data.albums) {
        let album = new Album(_album);

        //Add file child to app.songView for remote control
        this.children.albums[_album.id] = album;

        this.el.appendChild(await album.render());
      }

      //Add songs
      this.el.appendChild(songs);
      for (let _song of this.data.songs) {
        let song = new Song(_song, 'artistView');

        //Add file child to app.songView for remote control
        this.children.songs[_song.id] = song;

        this.el.appendChild(await song.render());
      }

      app.content.appendChild(this.el);
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = PinnedView;
