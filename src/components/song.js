'use strict';

const log = require('../utils/log');
const ActionBarSong = require('./actionBarSong');
const Tag = require('./tag');
const { playIcon, pauseIcon, loadingIcon } = require('../utils/svgs');

function Song(data, view) {
  this.el = document.createElement('div');
  this.data = data;
  this.view = view;
  this.children = {
    actionBar: null
  };

  this.playing = app.player.playing && app.player.current.id === this.data.id;
  this.loading = app.player.loading && app.player.current.id === this.data.id;

  this.handlePlayButton = (e) => {
    e.stopPropagation();

    if (this.view === 'album') app.player.queueAlbum(app.views.album.data, this.getPosition());
    else if (this.view === 'explore' || this.view === 'feed') app.player.queueFeed(this.data);
    else app.player.queueItem(this.data);
  }

  this.handleArtistButton = (e) => {
    e.stopPropagation();
    if (this.view === 'artist') return; //Prevent clicking artist forever

    app.addToHistory('artist', { artist: this.data.artist });
    app.changeView('artist', { artist: this.data.artist });
  }

  this.handleSongClick = (e) => {
    e.stopPropagation();
    if (view === 'song') return; //Prevent clicking song forever

    app.addToHistory('song', { song: this.data, action: 'files' });
    app.changeView('song', { song: this.data, action: 'files' });
  }

  this.setPlayingState = (value) => {
    if (value) this.el.querySelector('.play-button').innerHTML = pauseIcon;
    else if (!value && (this.playing || this.loading)) this.el.querySelector('.play-button').innerHTML = playIcon;

    this.playing = value;
    this.loading = false;
  }

  this.triggerSpinner = () => {
    this.loading = true;
    this.el.querySelector('.play-button').innerHTML = loadingIcon;
  }

  this.getPosition = () => {
    return app.views.album.data.songs.indexOf(this.data);
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
      let title = document.createElement('span');
      let tag = new Tag({ name: this.data.tags[0], type: 'song' });
      let tagEl = tag.render();
      let playButton = document.createElement('button');

      //Add classes for styling
      this.el.classList.add('song');
      main.classList.add('main');
      artist.classList.add('artist');
      titleAndArtist.classList.add('title-and-artist');
      title.className = 'title';
      separator.classList.add('separator');
      playButton.className = 'play-button';

      //Add attributes and innerHTML/textContent
      artist.textContent = this.data.artist;
      separator.textContent = '•';
      title.textContent = this.data.title;
      if (this.loading) playButton.innerHTML = loadingIcon;
      else playButton.innerHTML = this.playing ? pauseIcon : playIcon;

      //Build structure
      this.el.appendChild(main);
      main.appendChild(playButton);
      main.appendChild(titleAndArtist);
      titleAndArtist.appendChild(artist);
      titleAndArtist.appendChild(separator);
      titleAndArtist.appendChild(title);
      main.appendChild(tagEl);

      //Add action bar
      let actionBar = new ActionBarSong(this.data);
      this.children.actionBar = actionBar;
      this.el.appendChild(await actionBar.render());

      //Add listeners
      this.el.onclick = this.handleSongClick;
      playButton.onclick = this.handlePlayButton;
      artist.onclick = this.handleArtistButton;

      app.songs.push(this); //Store song reference in global state
      return this.el;
    }
    catch (err) {
      log.error(err.message);
    }
  }
}

module.exports = Song;
