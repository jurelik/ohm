const ActionBarAlbum = require('./actionBarAlbum');

function Album(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.childIsPlaying = (song) => { //This has to be declared above this.playing
    for (let _song of this.data.songs) {
      if (_song.id === song.id) {
        return true;
      }
    }

    return false;
  }
  this.playing = app.player.playing && this.childIsPlaying(app.player.current);

  this.playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="408.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M443.75 255c-8.285 0-15 6.716-15 15h0v120c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/><path fill="none" d="M408.5 238.5h183v183h-183z"/></svg>';
  this.pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="534.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M566 255h0v150h30V255h-30m120 0h0-30v150h30V255"/><path fill="none" d="M534.5 238.5h183v183h-183z"/></svg>'
  this.albumIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="538.5 238.5 183 183"><path fill="none" stroke="#EEE" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M555 405h105V285h-90c-8.285 0-15 6.716-15 15h0v105m150-150h0-90c-8.285 0-15 6.716-15 15h0v15m60 90h45V255"/><path fill="none" d="M538.5 238.5h183v183h-183v-183z"/></svg></svg>';

  this.handlePlayButton = (e) => {
    e.stopPropagation();

    this.setPlaying(!this.playing);
    this.reRender();
    app.player.queueFiles(this.data, this.getPosition(), 'album');
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

  this.remotePlayButtonTrigger = () => {
    this.setPlaying(!this.playing);
    this.reRender();
  }

  this.setPlaying = (value) => {
    this.playing = value;
  }

  this.reRender = () => {
    this.el.innerHTML = '';
    this.render();
  }

  this.getPosition = () => {
    //If this album is currently playing
    if (this.data.songs === app.player.queue) {
      return data.songs.indexOf(app.player.current);
    }

    return 0;
  }

  this.render = () => {
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
    if (!this.songView) {
      let actionBar = new ActionBarAlbum(this.data);
      this.el.appendChild(actionBar.render());
    }

    //Add listeners
    this.el.onclick = this.handleAlbumClick;
    playButton.onclick = this.handlePlayButton;
    artist.onclick = this.handleArtistButton;

    return this.el;
  }
}

module.exports = Album;
