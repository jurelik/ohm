const log = require('../utils/log');
const helpers = require('../utils/helpers');
const ActionBarAlbum = require('./actionBarAlbum');
const { playIcon, pauseIcon, albumIcon, loadingIcon } = require('../utils/svgs');

function Album(data, view) {
  this.el = document.createElement('div');
  this.data = data;
  this.view = view; //Where was the album created
  this.children = {};
  this.playing = app.player.playing && helpers.childIsPlaying(app.player.current, this.data.songs);
  this.loading = app.player.loading && helpers.childIsPlaying(app.player.current, this.data.songs);

  this.handlePlayButton = (e) => {
    e.stopPropagation();
    const position = this.getPosition();

    if (this.view === 'explore' || this.view === 'feed') app.player.queueFeed(this.data.songs[position])
    else app.player.queueAlbum(this.data, position);
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
    else if (app.player.feed || app.player.album) { //Check if the current song in the feed is playing which is contained in this album
      for (let song of this.data.songs) {
        if (song.id === app.player.current.id) return this.data.songs.indexOf(song);
      }
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
      let title = document.createElement('div');
      let tag = document.createElement('p');
      let playButton = document.createElement('button');
      let _albumIcon = document.createElement('div');

      //Add classes for styling
      this.el.classList.add('album');
      main.classList.add('main');
      artist.classList.add('artist');
      titleAndArtist.classList.add('title-and-artist');
      title.className = 'title';
      separator.classList.add('separator');
      tag.classList.add('tag');
      playButton.className = 'play-button';
      _albumIcon.classList.add('album-icon');

      //Add attributes and innerHTML/textContent
      artist.textContent = this.data.artist;
      separator.textContent = '•';
      title.textContent = this.data.title;
      tag.textContent = '#' + this.data.tags[0];
      if (this.loading) playButton.innerHTML = loadingIcon;
      else playButton.innerHTML = this.playing ? pauseIcon : playIcon;
      _albumIcon.innerHTML = albumIcon;

      //Build structure
      this.el.appendChild(main);
      main.appendChild(playButton);
      main.appendChild(titleAndArtist);
      main.appendChild(_albumIcon);
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
      log.error(err);
    }
  }
}

module.exports = Album;
