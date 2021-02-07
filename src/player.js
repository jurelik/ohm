function Player() {
  this.playerEl = document.querySelector('.player');
  this.song = null;

  this.init = () => {
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
    audio.onended = () => client.playing = false;
    audio.onplay = () => client.playing = true;
    audio.onpause = () => client.playing = false;

    this.playerEl.appendChild(playButton);
    this.playerEl.appendChild(titleAndArtist);
    this.playerEl.appendChild(audio);
  }

  this.play = (song) => {
    //Check if song is already loaded into player
    if (this.song === song) {
      client.playing ? this.playerEl.children[2].pause() : this.playerEl.children[2].play();
      return;
    }

    //Load song into the player and play
    this.song = song;
    this.playerEl.children[1].innerHTML = `now playing: ${this.song.artist} - ${this.song.title}`;
    this.playerEl.children[2].setAttribute('src', `http://127.0.0.1:8080${song.url}`);
    this.playerEl.children[2].play();
  }
}

module.exports = Player;
