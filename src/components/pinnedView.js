const ipfs = require('../utils/ipfs');
const log = require('../utils/log');
const Album = require('./album');
const Song = require('./song');

function PinnedView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {
    songs: {},
    albums: {}
  };

  this.init = async () => {
    try {
      const payload = await ipfs.getPinned();

      const _res = await fetch(`${app.URL}/api/pinned`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const res = await _res.json();
      if (res.type === 'error') throw res.err;

      return res.payload;
    }
    catch (err) {
      log.error(err);
    }
  }

  this.render = async () => {
    try {
      //Get data
      this.data = await this.init();

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