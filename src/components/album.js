const ActionBarAlbum = require('./actionBarAlbum');
const helpers = require('../utils/helpers');
const { playIcon, pauseIcon, loadingIcon } = require('../utils/svgs');

function Album(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {};
  this.playing = app.player.playing && helpers.childIsPlaying(app.player.current, this.data.songs);
  this.loading = false;

  this.handlePlayButton = (e) => {
    e.stopPropagation();
    if (this.loading) return; //Ignore action if we are currently loading a song/album

    app.player.queueFiles(this.data, this.getPosition());
  }

  this.handleArtistButton = (e) => {
    e.stopPropagation();
    if (app.current === 'artist') return; //Prevent clicking album forever

    app.addToHistory('artist', { artist: this.data.artist });
    app.changeView('artist', { artist: this.data.artist });
  }

  this.handleAlbumClick = (e) => {
    e.stopPropagation();
    if (app.current === 'album') return; //Prevent clicking album forever

    app.addToHistory('album', { album: this.data, action: 'files' });
    app.changeView('album', { album: this.data, action: 'files' });
  }

  this.setPlayingState = (value) => {
    if (value) this.el.querySelector('.play-button').innerHTML = pauseIcon;
    else if (!value && (this.playing || this.loading)) this.el.querySelector('.play-button').innerHTML = playIcon;

    this.loading = false;
    this.playing = value;
  }

  this.triggerSpinner = () => {
    this.loading = true;
    this.el.querySelector('.play-button').innerHTML = loadingIcon;
  }

  this.getPosition = () => {
    //If this album is currently playing
    if (this.data.songs === app.player.queue) {
      return data.songs.indexOf(app.player.current);
    }
    return 0;
  }

  this.reRender = () => {
    this.el.innerHTML = '';
    this.render();
  }

  this.render = async () => {
    try {
      //Create elements
      let main = document.createElement('div');
      let titleAndArtist = document.createElement('div');
      let artist = document.createElement('button');
      let separator = document.createElement('p');
      let title = document.createElement('p');
      let tag = document.createElement('p');
      let playButton = document.createElement('button');
      let albumIcon = document.createElement('div');

      //Add classes for styling
      this.el.classList.add('album');
      main.classList.add('main');
      artist.classList.add('artist');
      titleAndArtist.classList.add('title-and-artist');
      separator.classList.add('separator');
      tag.classList.add('tag');
      playButton.className = 'play-button';
      albumIcon.classList.add('album-icon');

      //Add attributes and innerHTML
      artist.innerHTML = this.data.artist;
      separator.innerHTML = '•';
      title.innerHTML = this.data.title;
      tag.innerHTML = '#' + this.data.tags[0];
      playButton.innerHTML = this.playing ? pauseIcon : playIcon;
      albumIcon.innerHTML = this.albumIcon;

      //Build structure
      this.el.appendChild(main);
      main.appendChild(playButton);
      main.appendChild(titleAndArtist);
      main.appendChild(albumIcon);
      titleAndArtist.appendChild(artist);
      titleAndArtist.appendChild(separator);
      titleAndArtist.appendChild(title);
      main.appendChild(tag);

      //Add action bar
      let actionBar = new ActionBarAlbum(this.data);
      this.children.actionBar = actionBar;
      this.el.appendChild(await actionBar.render());

      //Add listeners
      this.el.onclick = this.handleAlbumClick;
      playButton.onclick = this.handlePlayButton;
      artist.onclick = this.handleArtistButton;

      app.albums.push(this); //Store album reference in global state
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = Album;
