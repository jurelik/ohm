function Player() {
  this.el = document.querySelector('.player');
  this.audio = document.querySelector('audio');
  this.current = null;
  this.album = null;
  this.queue = [];
  this.queuePosition = 0;
  this.playing = false;

  this.playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="408.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M443.75 255c-8.285 0-15 6.716-15 15h0v120c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/><path fill="none" d="M408.5 238.5h183v183h-183z"/></svg>';
  this.pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="534.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M566 255h0v150h30V255h-30m120 0h0-30v150h30V255"/><path fill="none" d="M534.5 238.5h183v183h-183z"/></svg>'

  this.handleOnPlay = () => {
    this.playing = true;
    this.reRender();
  }

  this.handleOnPause = (e) => {
    //Make sure to distinguish between onend and onpause (they both get triggered when an audio element ends playback)
    if(e.target.ended) {
      return;
    }

    this.playing = false;
    this.reRender();
  }

  this.handleOnEnded = () => {
    this.playing = false;
    this.handleRemoteTriggers(this.current.id, this.current.type);
    this.reRender();
  }

  this.handleRemoteTriggers = (id, type) => {
    for (let _view in app.views) {
      let view = app.views[_view];
      if (view === null) {
        continue;
      }

      switch (_view) {
        case 'exploreView':
          if (type === 'song' && view.children.songs[id]) view.children.songs[id].remotePlayButtonTrigger();
          break;
        case 'songView':
          if (type === 'song' && view.children.song.data.id === id) view.children.song.remotePlayButtonTrigger();
          if (this.isFile(type) && view.children.files[id]) view.children.files[id].remotePlayButtonTrigger();
          break;
        default:
          console.error('view not recognized');
          break;
      }
    }
  }

  this.handlePlayButton = () => {
    this.handleRemoteTriggers(this.current.id);
    this.play();
  }

  this.isFile = (type) => {
    return type === 'original' || type === 'internal' || type === 'external';
  }

  this.updateSrc = () => {
    return this.audio.setAttribute('src', `http://127.0.0.1:8080${this.current.url}`);
  }

  this.queueFile = (file) => {
    //Check if file already loaded
    if (this.queue.length === 1 && this.queue[0] === file) {
      return this.play();
    }

    //Change the playing state on previous file
    if(this.current && this.playing) this.handleRemoteTriggers(this.current.id, this.current.type);

    this.playing = false;
    this.queue = [file];
    this.current = file;
    this.updateSrc();
    this.play();
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
    let playButton = document.createElement('button')
    let titleAndArtist = document.createElement('p');

    //Add attributes and innerHTML
    playButton.innerHTML = this.playing ? this.pauseIcon : this.playIcon;
    titleAndArtist.innerHTML = this.current ? `${this.current.artist} - ${this.current.title}` : 'Load a song';

    //Add listeners
    playButton.onclick = this.handlePlayButton;
    this.audio.onended = this.handleOnEnded;
    this.audio.onplay = this.handleOnPlay;
    this.audio.onpause = this.handleOnPause;

    this.el.appendChild(playButton);
    this.el.appendChild(titleAndArtist);
  }

}

module.exports = Player;
