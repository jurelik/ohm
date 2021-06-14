const { playIcon, pauseIcon, loadingIcon } = require('../utils/svgs');

function File(data) {
  this.el = document.createElement('tr');
  this.data = data;
  this.playing = app.player.playing && app.player.current === this.data;
  this.loading = app.player.playing && app.player.current.id === this.data.id && app.player.current.type === this.data.type;

  this.handlePlayButton = (e) => {
    e.stopPropagation();
    if (this.loading) return; //Ignore action if we are currently loading a song/album
    app.player.queueSong(this.data);
  }

  this.remotePlayButtonTrigger = () => {
    this.setPlaying(!this.playing);
    this.reRender();
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

  this.reRender = () => {
    this.el.innerHTML = '';
    this.render();
  }

  this.render = () => {
    //Create elements
    let playButtonCell = document.createElement('td');
    let playButton = document.createElement('button');
    let id = document.createElement('td');
    let name = document.createElement('td');
    let artist = document.createElement('td');
    let type = document.createElement('td');
    let fileType = document.createElement('td');
    let tags = document.createElement('td');
    let info = document.createElement('td');
    let checkBoxCell = document.createElement('td');
    let checkBox = document.createElement('input');

    //Add classes for styling
    this.el.classList.add('file');
    playButtonCell.className = 'play-button-cell';
    playButton.className = 'play-button';

    //Add attributes and innerHTML
    playButton.innerHTML = this.playing ? pauseIcon : playIcon;
    id.innerHTML = data.id;
    name.innerHTML = data.name;
    artist.innerHTML = data.artist;
    type.innerHTML = data.type;
    fileType.innerHTML = data.format;
    tags.innerHTML = data.tags.join(', ');
    info.innerHTML = data.info;
    checkBox.type = 'checkbox';

    //Build structure
    this.el.appendChild(playButtonCell);
    this.el.appendChild(id);
    this.el.appendChild(name);
    this.el.appendChild(artist);
    this.el.appendChild(type);
    this.el.appendChild(fileType);
    this.el.appendChild(tags);
    this.el.appendChild(info);
    this.el.appendChild(checkBoxCell);
    data.format === 'wav' || data.format === 'mp3' ? playButtonCell.appendChild(playButton) : null;
    checkBoxCell.appendChild(checkBox);

    //Add listeners
    playButton.onclick = this.handlePlayButton;

    app.files.push(this); //Store file reference in global state
    return this.el;
  }
}

module.exports = File;
