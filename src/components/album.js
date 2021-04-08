const ActionBarAlbum = require('./actionBarAlbum');
const helpers = require('../utils/helpers');

function Album(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {};
  this.playing = app.player.playing && helpers.childIsPlaying(app.player.current, this.data.songs);
  this.loading = false;

  this.playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="408.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M443.75 255c-8.285 0-15 6.716-15 15h0v120c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/><path fill="none" d="M408.5 238.5h183v183h-183z"/></svg>';
  this.pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="534.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M566 255h0v150h30V255h-30m120 0h0-30v150h30V255"/><path fill="none" d="M534.5 238.5h183v183h-183z"/></svg>'
  this.albumIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="538.5 238.5 183 183"><path fill="none" stroke="#EEE" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M555 405h105V285h-90c-8.285 0-15 6.716-15 15h0v105m150-150h0-90c-8.285 0-15 6.716-15 15h0v15m60 90h45V255"/><path fill="none" d="M538.5 238.5h183v183h-183v-183z"/></svg></svg>';
  this.loadingIcon = '<div class="spinner"></div>';

  this.handlePlayButton = (e) => {
    e.stopPropagation();
    if (this.loading) return; //Ignore action if we are currently loading a song/album

    //if (!this.playing) triggerSpinner()
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
    if (value) this.el.querySelector('.play-button').innerHTML = this.pauseIcon;
    else if (!value && (this.playing || this.loading)) this.el.querySelector('.play-button').innerHTML = this.playIcon;

    this.loading = false;
    this.playing = value;
  }

  this.getPosition = () => {
    //If this album is currently playing
    if (this.data.songs === app.player.queue) {
      return data.songs.indexOf(app.player.current);
    }
    return 0;
  }

  this.triggerSpinner = () => {
    this.loading = true;
    this.el.querySelector('.play-button').innerHTML = this.loadingIcon;
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
      titleAndArtist.classList.add('titleAndArtist');
      separator.classList.add('separator');
      tag.classList.add('tag');
      playButton.className = 'play-button';
      albumIcon.classList.add('album-icon');

      //Add attributes and innerHTML
      artist.innerHTML = this.data.artist;
      separator.innerHTML = '•';
      title.innerHTML = this.data.title;
      tag.innerHTML = '#' + this.data.tags[0];
      playButton.innerHTML = this.playing ? this.pauseIcon : this.playIcon;
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
