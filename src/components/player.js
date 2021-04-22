const log = require('../utils/log');
const { playIcon, pauseIcon, loadingIcon } = require('../utils/svgs');

function Player() {
  this.el = document.querySelector('.player');
  this.audio = document.querySelector('audio');
  this.current = null; //Current song playing
  this.album = null; //Current album ID
  this.queue = [];
  this.queuePosition = 0;
  this.playing = false;
  this.loading = false;

  //EVENT HANDLERS
  this.handleOnPlay = () => {
    this.triggerSpinner();
  }

  this.handleOnPlaying = () => {
    this.loading = false;
    this.playing = true;
    this.setRemotePlayingState(true);
    this.reRender();
  }

  this.handleOnPause = (e) => {
    //Make sure to distinguish between onend and onpause (they both get triggered when an audio element ends playback)
    if(e.target.ended) return;

    this.playing = false;
    this.setRemotePlayingState(false);
    this.reRender();
  }

  this.handleOnEnded = () => {
    this.playing = false;
    this.queuePosition++;
    if (this.queue.length === 1) {
      this.setRemotePlayingState(false);
      return this.reRender();
    }

    //Stop playback if this was the last song in the queue
    if (this.queuePosition > this.queue.length - 1) {
      this.setRemotePlayingState(false);
      this.reRender();
      this.queue = [];
      return this.queuePosition = 0;
    }

    //Continue playing if more items are in the queue
    this.current = this.queue[this.queuePosition];
    this.updateSrc();
    this.play();
  }

  //HELPERS
  this.setRemotePlayingState = (playing) => { //Update playing state in the currently displayed songs & albums
    if (playing) {
      for (const song of app.songs) {
        if (song.data.id === this.current.id && this.current.type === 'song') song.setPlayingState(true);
        else song.setPlayingState(false);
      }

      for (const album of app.albums) {
        if (!this.album) album.setPlayingState(false);
        else if (album.data.id === this.album && this.current.type === 'song') album.setPlayingState(true);
        else album.setPlayingState(false);
      }

      if (app.files.length === 0) return; //Ignore if no files are displayed
      for (const file of app.files) {
        if (file.data.id === this.current.id && file.data.type === this.current.type) file.setPlayingState(true);
        else file.setPlayingState(false);
      }
    }
    else {
      for (const song of app.songs) song.setPlayingState(false);
      for (const album of app.albums) album.setPlayingState(false);
      for (const file of app.files) file.setPlayingState(false);
    }
  }

  this.interruptLoading = () => { //Interrupt the loading animation in currently displayed songs & albums
    for (const song of app.songs) {
      if (song.data.id === this.current.id) continue;
      song.setPlayingState(false);
    }

    for (const album of app.albums) {
      if (album.data.id === this.album) continue;
      album.setPlayingState(false);
    }
  }

  this.handlePlayButton = () => {
    if (!this.current) return log.error('Please load a song first');
    this.play();
  }

  this.updateSrc = () => {
    //If song, artist and title must be included as the CID points to the song parent folder
    if (this.current.type === 'song') return this.audio.setAttribute('src', `${app.GATEWAY}/ipfs/${this.current.cid}/${this.current.artist} - ${this.current.title || this.current.name}.${this.current.format}`);

    return this.audio.setAttribute('src', `${app.GATEWAY}/ipfs/${this.current.cid}`);
  }

  this.queueFile = (file) => {
    //Check if file already loaded
    if (this.queue.length === 1 && this.queue[0].id === file.id && this.queue[0].type === file.type) return this.play();

    this.album = null; //Reset this.album
    this.playing = false;
    this.queue = [file];
    this.current = file;
    this.interruptLoading(); //Interrupt the loading animation in other songs/albums
    this.updateSrc(); //This makes the audio element reload so check if file is already loaded before triggering
    this.play();
  }

  this.sameQueue = (files) => {
    if (this.queue.length !== files.length) return false;

    for (let x = 0; x < files.length; x++) {
      if (this.queue[x].id !== files[x].id) return false;
    }

    return true;
  }

  this.queueFiles = (album, position) => {
    let files = album.songs;

    //Check if queue is already loaded and we are playing the same song
    if (this.sameQueue(files) && this.queuePosition === position) return this.play();

    this.playing = false;
    this.queue = files;
    this.queuePosition = position;
    this.current = files[this.queuePosition];
    this.album = album.id;
    this.interruptLoading(); //Interrupt the loading animation in other songs/albums
    this.updateSrc(); //This makes the audio element reload so check if file is already loaded before triggering
    this.play();
  }

  this.play = () => {
    this.playing ? this.audio.pause() : this.audio.play();
  }

  this.reRender = () => {
    this.el.innerHTML = '';
    this.render();
  }

  this.triggerSpinner = () => {
    //Update main section
    this.loading = true;
    this.el.querySelector('.main-play-button').innerHTML = loadingIcon;

    //Update remote songs & albums
    for (const song of app.songs) if (song.data.id === this.current.id && this.current.type === 'song') song.triggerSpinner();
    for (const album of app.albums) if (album.data.id === this.album && this.current.type === 'song') album.triggerSpinner();
    for (const file of app.files) if (file.data.id === this.current.id && file.data.type === this.current.type) file.triggerSpinner();
  }

  this.render = () => {
    //Create elements
    let playButton = document.createElement('button')
    let titleAndArtist = document.createElement('p');

    //Set class names
    playButton.className = 'main-play-button';

    //Add attributes and innerHTML
    playButton.innerHTML = this.playing ? pauseIcon : playIcon;
    titleAndArtist.innerHTML = this.current ? `${this.current.artist} - ${this.current.title || this.current.name}` : 'Load a song';

    //Add listeners
    playButton.onclick = this.handlePlayButton;
    this.audio.onended = this.handleOnEnded;
    this.audio.onplay = this.handleOnPlay;
    this.audio.onplaying = this.handleOnPlaying;
    this.audio.onpause = this.handleOnPause;

    this.el.appendChild(playButton);
    this.el.appendChild(titleAndArtist);
  }

}

module.exports = Player;
