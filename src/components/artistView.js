const { testArtist } = require('../testData');
const Album = require('./album');
const Song = require('./song');
const { locationIcon } = require('../utils/svgs');

function ArtistView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.artist = null;
  this.children = {
    songs: {},
    albums: {}
  };

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
      //Fetch if artist is not loaded
      if (!this.artist) this.artist = await this.fetch();

      //Create elements
      let nameAndFollow = document.createElement('div');
      let name = document.createElement('div');
      let bio = document.createElement('p');
      let locationDiv = document.createElement('div');
      let location = document.createElement('p');
      let albums = document.createElement('p');
      let songs = document.createElement('p');

      //Add classes for styling
      this.el.className = 'artist';
      nameAndFollow.className = 'name-and-follow';
      locationDiv.className = 'location-div';
      bio.className = 'bio';

      //Add attributes and innerHTML
      name.innerHTML = this.artist.name;
      bio.innerHTML = this.artist.bio;
      locationDiv.innerHTML = locationIcon;
      location.innerHTML = this.artist.location;
      albums.innerHTML = 'albums:';
      songs.innerHTML = 'songs:';

      //Build structure
      this.el.appendChild(nameAndFollow);
      nameAndFollow.appendChild(name);
      this.el.appendChild(locationDiv);
      locationDiv.appendChild(location);
      this.el.appendChild(bio);
      this.el.appendChild(albums);

      //Add follow button
      if (this.artist.name !== app.artist) {
        let follow = document.createElement('button');
        follow.classList.add('follow');
        if (this.artist.following) follow.classList.add('following');
        follow.innerHTML = this.artist.following ? 'following': 'follow';
        nameAndFollow.appendChild(follow);

        //Add listener
        follow.onclick = this.handleFollow;
      }

      //Add albums
      for (let _album of this.artist.albums) {
        let album = new Album(_album, 'artist');

        //Add file child to app.songView for remote control
        this.children.albums[_album.id] = album;

        this.el.appendChild(await album.render());
      }

      this.el.appendChild(songs);

      //Add songs
      for (let _song of this.artist.songs) {
        let song = new Song(_song, 'artist');

        //Add file child to app.songView for remote control
        this.children.songs[_song.id] = song;

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
