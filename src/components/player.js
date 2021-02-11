function Player() {
  this.el = document.querySelector('.player');
  this.song = null;
  this.queue = [];
  this.queuePosition = 0;

  this.handleOnEnded = () => {
    this.queuePosition++;

    if (this.queue[this.queuePosition]) {
      this.play(this.queue[this.queuePosition]);
    }
    else {
      app.playing = false;
      this.queuePosition = 0;
    }
  }

  this.queueFile = (file) => {
    //Check if queue is already loaded into player
    if (this.queue[0] === file) {
      app.playing ? this.el.children[2].pause() : this.el.children[2].play();
      return;
    }

    this.queue = [file];
    this.queuePosition = 0;
    this.play(this.queue[this.queuePosition]);
  }

  this.queueFiles = (list) => {
    //Check if queue is already loaded into player
    if (this.queue === list) {
      app.playing ? this.el.children[2].pause() : this.el.children[2].play();
      return;
    }

    this.queue = list;
    this.queuePosition = 0;
    this.play(this.queue[this.queuePosition]);
  }

  this.play = (song) => {
    //Check if song is already loaded into player
    if (this.song === song) {
      app.playing ? this.el.children[2].pause() : this.el.children[2].play();
      return;
    }
    console.log(song)

    //Load song into the player and play
    this.song = song;
    this.el.children[1].innerHTML = `${this.song.artist} - ${this.song.title}`;
    this.el.children[2].setAttribute('src', `http://127.0.0.1:8080${song.url}`);
    this.el.children[2].play();
  }

  this.render = () => {
    //Create elements
    let playButton = document.createElement('button')
    let titleAndArtist = document.createElement('p');
    let audio = document.createElement('audio');

    playButton.classList.add('play-button');
    titleAndArtist.classList.add('title-and-artist');

    //Add attributes and innerHTML
    playButton.innerHTML = 'play/pause'
    titleAndArtist.innerHTML = 'Load a song';
    audio.setAttribute('controls', 'true');

    //Add listeners
    playButton.onclick = () => this.play(this.song);
    audio.onended = this.handleOnEnded;
    audio.onplay = () => app.playing = true;
    audio.onpause = () => app.playing = false;

    this.el.appendChild(playButton);
    this.el.appendChild(titleAndArtist);
    this.el.appendChild(audio);
  }

}

module.exports = Player;
