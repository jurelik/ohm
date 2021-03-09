const { testArtist } = require('../testData');
const Album = require('./album');
const Song = require('./song');

function ArtistView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.artist = null;
  this.children = {
    songs: {},
    albums: {}
  };
  this.locationIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="599 269 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M690.5 435.5c-40-30-60-60-60-90 0-33.137 26.862-60 60-60h0c33.137 0 60 26.863 60 60h0c0 30-20 60-60 90m0-135c-24.854 0-45 20.147-45 45h0c0 24.854 20.146 45 45 45h0c24.853 0 45-20.146 45-45h0c0-24.853-20.147-45-45-45h0"/><path fill="none" d="M599 269h183v183H599V269z"/></svg>'

  this.fetch = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const _res = await fetch(`${app.URL}/api/artist/${this.data}`);
        const res = await _res.json();

        if (res.type === 'error') return reject(res.err);

        resolve(res.payload);
      }
      catch (err) {
        reject(err);
      }
    });
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML
      //Fetch if artist is not loaded
      if (!this.artist) this.artist = await this.fetch();

      //Create elements
      let name = document.createElement('p');
      let bio = document.createElement('p');
      let locationDiv = document.createElement('div');
      let location = document.createElement('p');
      let albums = document.createElement('p');
      let songs = document.createElement('p');

      //Add classes for styling
      this.el.className = 'artist';
      locationDiv.className = 'location-div';
      bio.className = 'bio';

      //Add attributes and innerHTML
      name.innerHTML = this.artist.name;
      bio.innerHTML = this.artist.bio;
      locationDiv.innerHTML = this.locationIcon;
      location.innerHTML = this.artist.location;
      albums.innerHTML = 'albums:';
      songs.innerHTML = 'songs:';

      //Build structure
      this.el.appendChild(name);
      this.el.appendChild(locationDiv);
      locationDiv.appendChild(location);
      this.el.appendChild(bio);
      this.el.appendChild(albums);

      //Add albums
      for (let _album of this.artist.albums) {
        let album = new Album(_album);

        //Add file child to app.songView for remote control
        this.children.albums[_album.id] = album;

        this.el.appendChild(album.render());
      }

      this.el.appendChild(songs);

      //Add songs
      for (let _song of this.artist.songs) {
        let song = new Song(_song, 'artistView');

        //Add file child to app.songView for remote control
        this.children.songs[_song.id] = song;

        this.el.appendChild(await song.render());
      }

      //Add listeners

      return app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = ArtistView;
