const log = require('../utils/log');
const { playIconBig, pauseIconBig, loadingIcon, nextIcon, previousIcon } = require('../utils/svgs');

function Player() {
  this.el = document.querySelector('.player');
  this.audio = document.querySelector('audio');
  this.current = null; //Current song playing
  this.album = null; //Current album ID
  this.feed = false; //Are we playing a feed?
  this.queue = [];
  this.queuePosition = 0;
  this.playing = false;
  this.loading = false;
  this.seekClicked = false; //Keep track of user clicking the seek slider

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

    //Stop playback if this was the last song in the queue
    if (this.queue.length === 1 || this.queuePosition > this.queue.length - 1) {
      this.setRemotePlayingState(false);
      this.queue = [];
      this.queuePosition = 0;
      this.current = null;
      return this.reRender();
    }

    //Continue playing if more items are in the queue
    this.current = this.queue[this.queuePosition];
    this.album = this.current.albumId ? this.current.albumId : null; //Update album in case we're in a feed
    this.updateSrc();
    this.play();
  }

  this.handleOnTimeUpdate = () => {
    if (!this.seekClicked) this.el.querySelector('.seek').value = this.getSeekValue();
  }

  //BUTTON HANDLERS
  this.handleBackButton = () => {
    if (!this.current) return log.error('Please load a song first.');
    if (this.queuePosition <= 0) log.error("Can't go further back in time Morty.");
    if (this.audio.currentTime < 5 && this.queuePosition > 0) this.queuePosition--;

    //Check if we are past the 5 second mark of current song
    if (this.audio.currentTime < 5) {
      this.current = this.queue[this.queuePosition];
      this.album = this.current.albumId ? this.current.albumId : null; //Update album in case we're in a feed
    }

    this.playing = false;
    this.updateSrc();
    this.play();
  }

  this.handlePlayButton = () => {
    if (!this.current) return log.error('Please load a song first.');
    this.play();
  }

  this.handleForwardButton = () => {
    if (!this.current) return log.error('Please load a song first.');
    if (this.queuePosition >= this.queue.length - 1) return log.error('No song left in queue.');

    this.playing = false;
    this.queuePosition++;

    this.current = this.queue[this.queuePosition];
    this.album = this.current.albumId ? this.current.albumId : null; //Update album in case we're in a feed
    this.updateSrc();
    this.play();
  }

  this.handleSeekChange = (e) => {
    if (!this.audio.duration) return; //Audio not loaded

    this.seekClicked = false;
    const percentage = e.target.value / 100;
    return this.audio.currentTime = this.audio.duration * percentage;
  }

  this.handleSeekInput = (e) => {
    this.seekClicked = true;
  }

  //QUEUE HANDLERS
  this.queueSong = (file) => {
    //Check if file already loaded
    if (this.queue.length === 1 && this.current.id === file.id) return this.play();
    const alreadyLoaded = this.feed && this.current.id === file.id; //Is the song already playing in a feed?

    this.album = null; //Reset this.album
    this.queue = [file];
    this.queuePosition = 0;
    this.current = file;
    this.feed = false; //Reset this.feed
    if (alreadyLoaded) return this.play(); //Return here if song is already loaded

    this.playing = false;
    this.interruptLoading(); //Interrupt the loading animation in other songs/albums
    this.updateSrc(); //This makes the audio element reload so check if file is already loaded before triggering
    this.play();
  }

  this.queueFeed = (song) => {
    const feed = this.deconstructFeed();
    const position = this.getSongPosition(song, feed); //Position of selected song in feed
    let _position; //Position of this.current in new feed (if applicable) - means song was loaded in a different view

    //Check if queue is already loaded and we are playing the same song
    if (this.sameQueue(feed) && this.queuePosition === position) return this.play();

    _position = !this.feed && this.current ? this.checkIfCurrentSongIncluded(feed) : null; //Check if the current song is included in the feed

    this.feed = true; //Set this.feed to active
    this.queue = feed;
    this.queuePosition = _position || position;
    this.current = feed[this.queuePosition];
    this.album = this.current.albumId ? this.current.albumId : null;
    if (_position) return this.play(); //Return here if _position was found

    this.playing = false;
    this.interruptLoading(); //Interrupt the loading animation in other songs/albums
    this.updateSrc(); //This makes the audio element reload so check if file is already loaded before triggering
    return this.play();
  }

  this.queueAlbum = (album, position) => {
    let files = album.songs;
    let _position; //Position of this.current in album (if applicable) - means song was loaded in a feed if not null

    //Check if queue is already loaded and we are playing the same song
    if (this.sameQueue(files) && this.queuePosition === position) return this.play();

    if (this.current) _position = this.checkIfCurrentSongIncluded(files); //Check if the current song is included in the album

    this.feed = false; //Reset this.feed
    this.queue = files;
    this.queuePosition = _position || position;
    this.current = files[this.queuePosition];
    this.album = album.id;
    if (_position) return this.play(); //Return here if _position was found

    this.playing = false;
    this.interruptLoading(); //Interrupt the loading animation in other songs/albums
    this.updateSrc(); //This makes the audio element reload so check if file is already loaded before triggering
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

  this.updateSrc = () => {
    //If song, artist and title must be included as the CID points to the song parent folder
    if (this.current.type === 'song') return this.audio.setAttribute('src', `${app.GATEWAY}/ipfs/${this.current.cid}/${this.current.artist} - ${this.current.title || this.current.name}.${this.current.format}`);

    return this.audio.setAttribute('src', `${app.GATEWAY}/ipfs/${this.current.cid}`);
  }

  this.sameQueue = (files) => {
    if (this.queue.length !== files.length) return false;

    for (let x = 0; x < files.length; x++) {
      if (this.queue[x].id !== files[x].id) return false;
    }

    return true;
  }

  this.deconstructFeed = () => { //Goes over the feed and turns deconstructs albums into songs
    const feed = app.views[app.current].data;
    let formatted = [];

    for (let item of feed) {
      if (item.type === 'album') {
        for (let song of item.songs) {
          formatted.push(song)
        };
      }
      else formatted.push(item);
    }

    return formatted;
  }

  this.checkIfCurrentSongIncluded = (array) => { //Check if this.current is in array and return position
    let position;

    array.some((song, index) => { //Check if the current song is in this album
      if (song.id === this.current.id) {
        position = index;
        return true;
      }
    });

    return position;
  }

  this.getSongPosition = (song, array) => { //Get position of song in provided array
    let position;

    array.some((_song, index) => { //Find position of triggered song in feed
      if (_song.id === song.id) {
        position = index;
        return true;
      }
    });

    return position;
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

  this.getSeekValue = () => {
    if (this.audio.duration) return this.audio.currentTime / this.audio.duration * 100;
    return 0;
  }

  this.play = () => {
    this.playing ? this.audio.pause() : this.audio.play();
  }

  this.reRender = () => {
    this.el.innerHTML = '';
    this.render();
  }

  this.render = () => {
    //Create elements
    let backButton = document.createElement('button');
    let playButton = document.createElement('button')
    let forwardButton = document.createElement('button');
    let main = document.createElement('div');
    let titleAndArtist = document.createElement('p');
    let seek = document.createElement('input');

    //Set class names
    playButton.className = 'main-play-button';
    backButton.className = 'main-back-button';
    forwardButton.classList.add('main-forward-button');
    main.className = 'player-main';
    seek.className = 'seek';
    if (this.queuePosition >= this.queue.length - 1) forwardButton.disabled = true;
    if (!this.current) backButton.disabled = true;

    //Add attributes and innerHTML
    backButton.innerHTML = previousIcon;
    playButton.innerHTML = this.playing ? pauseIconBig : playIconBig;
    forwardButton.innerHTML = nextIcon;
    titleAndArtist.innerHTML = this.current ? `${this.current.artist} - ${this.current.title || this.current.name}` : 'Load a song';
    seek.setAttribute('type', 'range');
    seek.setAttribute('step', 'any');
    seek.setAttribute('max', '100');
    seek.setAttribute('value', this.getSeekValue());

    //Add listeners
    backButton.onclick = this.handleBackButton;
    playButton.onclick = this.handlePlayButton;
    forwardButton.onclick = this.handleForwardButton;
    this.audio.onended = this.handleOnEnded;
    this.audio.onplay = this.handleOnPlay;
    this.audio.onplaying = this.handleOnPlaying;
    this.audio.onpause = this.handleOnPause;
    this.audio.ontimeupdate = this.handleOnTimeUpdate;
    seek.onchange = this.handleSeekChange;
    seek.oninput = this.handleSeekInput;

    this.el.appendChild(backButton);
    this.el.appendChild(playButton);
    this.el.appendChild(forwardButton);
    this.el.appendChild(main);
    main.appendChild(titleAndArtist);
    main.appendChild(seek);
  }
}

module.exports = Player;
