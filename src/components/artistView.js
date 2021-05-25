const Album = require('./album');
const Song = require('./song');
const Artist = require('./artist');

function ArtistView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.artist = null;

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

  this.handleFollow = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const following = this.artist.following;
      let _res;

      if (following) _res = await fetch(`${app.URL}/api/unfollow/${this.artist.id}`);
      else _res = await fetch(`${app.URL}/api/follow/${this.artist.id}`);

      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      this.artist.following = !following;

      //Update DOM
      const button = this.el.querySelector('.follow');
      button.innerHTML = this.artist.following ? 'following' : 'follow';
      if (!this.artist.following) button.classList.remove('following');
      else button.classList.add('following');
    }
    catch (err) {
      console.error(err);
    }
  }

  this.refresh = async () => {
    try {
      this.artist = null;
      await this.render();
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML

      if (!this.artist) this.artist = await this.fetch(); //Fetch if artist is not loaded

      //Create elements
      let bio = document.createElement('p');
      let albums = document.createElement('p');
      let songs = document.createElement('p');

      //Add classes for styling
      this.el.className = 'artist';
      bio.className = 'bio';

      //Add attributes and innerHTML
      bio.innerHTML = this.artist.bio;
      albums.innerHTML = 'albums:';
      songs.innerHTML = 'songs:';

      //Add artist
      let artist = new Artist(this.artist, 'artist');
      this.el.appendChild(artist.render());

      //Build structure
      this.el.appendChild(bio);
      this.el.appendChild(albums);

      //Add albums
      for (let _album of this.artist.albums) {
        let album = new Album(_album, 'artist');
        this.el.appendChild(await album.render());
      }

      this.el.appendChild(songs);

      //Add songs
      for (let _song of this.artist.songs) {
        let song = new Song(_song, 'artist');
        this.el.appendChild(await song.render());
      }

      return app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = ArtistView;
