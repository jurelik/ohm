function Player() {
  this.el = document.querySelector('.player');
  this.audio = document.querySelector('audio');
  this.song = null;
  this.queue = [];
  this.queuePosition = 0;
  this.playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="408.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M443.75 255c-8.285 0-15 6.716-15 15h0v120c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/><path fill="none" d="M408.5 238.5h183v183h-183z"/></svg>';
  this.pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="534.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M566 255h0v150h30V255h-30m120 0h0-30v150h30V255"/><path fill="none" d="M534.5 238.5h183v183h-183z"/></svg>'

  this.state = {
    playing: false,
  }

  this.handleOnEnded = () => {
    this.queuePosition++;

    if (this.queue[this.queuePosition]) {
      this.play(this.queue[this.queuePosition]);
    }
    else {
      app.updatePlayButtons(this.song.id);
      this.state.playing = false;
      this.el.innerHTML = '';
      this.render();
      this.queuePosition = 0;
    }
  }

  this.handlePlayButton = () => {
    //Check if the current song is displayed in the current view
    if (this.song) {
      app.updatePlayButtons(this.song.id);
    }

    if (this.song) return this.play(this.song);
  }

  this.queueFile = (file) => {
    //Check if queue is already loaded into player
    if (this.queue[0] !== file) {
      //If another song is playing handle the playButton before changing file
      this.song && this.state.playing ? app.updatePlayButtons() : null;

      this.queue = [file];
      this.queuePosition = 0;
    }

    return this.play(this.queue[this.queuePosition]);
  }

  this.queueFiles = (list) => {
    //Check if queue is already loaded into player
    if (this.queue !== list) {
      this.queue = list;
      this.queuePosition = 0;
    }

    return this.play(this.queue[this.queuePosition]);
  }

  this.play = (song) => {
    //Check if song is already loaded into player
    this.song === song ? this.state.playing = !this.state.playing : this.state.playing = true;

    //Load song into the player and play
    this.song = song;
    this.el.innerHTML = '';
    this.render();
    this.state.playing ? this.audio.play() : this.audio.pause();
  }

  this.render = () => {
    //Create elements
    let playButton = document.createElement('button')
    let titleAndArtist = document.createElement('p');

    //Add attributes and innerHTML
    playButton.innerHTML = this.state.playing ? this.pauseIcon : this.playIcon;
    titleAndArtist.innerHTML = this.song ? `${this.song.artist} - ${this.song.title}` : 'Load a song';

    //Check if src needs to be updated to prevent re-render of the audio element
    if (this.song && this.audio.getAttribute('src') !== `http://127.0.0.1:8080${this.song.url}`) {
      this.audio.setAttribute('src', `http://127.0.0.1:8080${this.song.url}`);
    }

    //Add listeners
    playButton.onclick = this.handlePlayButton;
    this.audio.onended = this.handleOnEnded;
    this.audio.onplay = () => app.handlePlayPause(true);
    this.audio.onpause = () => app.handlePlayPause(false);

    this.el.appendChild(playButton);
    this.el.appendChild(titleAndArtist);
  }

}

module.exports = Player;
