function File(data) {
  this.el = document.createElement('tr');
  this.data = data;
  this.state = {};
  this.playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="408.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M443.75 255c-8.285 0-15 6.716-15 15h0v120c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/><path fill="none" d="M408.5 238.5h183v183h-183z"/></svg>';
  this.pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="534.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M566 255h0v150h30V255h-30m120 0h0-30v150h30V255"/><path fill="none" d="M534.5 238.5h183v183h-183z"/></svg>'

  this.handlePlayButton = (e, file) => {
    e.stopPropagation();
    app.player.state.playing && app.player.song === this.data ? e.target.innerHTML = this.playIcon : e.target.innerHTML = this.pauseIcon;
    app.player.queueFile(file)
  }

  this.handlePlayButtonRemote = () => {
    let button = this.el.querySelector('button');
    app.player.state.playing ? button.innerHTML = this.playIcon : button.innerHTML = this.pauseIcon;
  }

  this.render = () => {
    //Create elements
    let name = document.createElement('td');
    let artist = document.createElement('td');
    let playButtonCell = document.createElement('td');
    let playButton = document.createElement('button');
    let checkBoxCell = document.createElement('td');
    let checkBox = document.createElement('input');

    //Add classes for styling
    this.el.classList.add('file');

    //Add attributes and innerHTML
    name.innerHTML = data.name;
    artist.innerHTML = data.artist;
    playButton.innerHTML = this.playIcon;
    checkBox.type = 'checkbox';

    //Build structure
    this.el.appendChild(playButtonCell);
    this.el.appendChild(name);
    this.el.appendChild(artist);
    this.el.appendChild(checkBoxCell);
    data.fileType === 'wav' || data.fileType === 'mp3' ? playButtonCell.appendChild(playButton) : null;
    checkBoxCell.appendChild(checkBox);

    //Add listeners
    playButton.onclick = (e) => this.handlePlayButton(e, this.data);

    return this.el;
  }
}

module.exports = File;
