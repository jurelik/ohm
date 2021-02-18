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

  this.fetch = () => {
    //Fetch data from server here
    this.artist = testArtist;
  }

  this.render = () => {
    //Fetch if artist is not loaded
    if (!this.artist) this.fetch();

    //Create elements
    let name = document.createElement('p');
    let bio = document.createElement('p');
    let location = document.createElement('p');
    let albums = document.createElement('p');
    let songs = document.createElement('p');

    //Add classes for styling
    this.el.className = 'artist';
    bio.className = 'bio';

    //Add attributes and innerHTML
    name.innerHTML = this.artist.name;
    bio.innerHTML = this.artist.bio;
    location.innerHTML = this.artist.location;
    albums.innerHTML = 'albums:';
    songs.innerHTML = 'songs:';

    //Build structure
    this.el.appendChild(name);
    this.el.appendChild(location);
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

      this.el.appendChild(song.render());
    }

    //Add listeners

    return this.el;
  }

}

module.exports = ArtistView;
