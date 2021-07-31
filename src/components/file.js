'use strict';

const { playIcon, pauseIcon, loadingIcon } = require('../utils/svgs');

function File(data) {
  this.el = document.createElement('tr');
  this.data = data;
  this.playing = app.player.playing && app.player.current === this.data;
  this.loading = app.player.loading && app.player.current.id === this.data.id && app.player.current.type === this.data.type;

  this.handlePlayButton = (e) => {
    e.stopPropagation();
    app.player.queueItem(this.data);
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

  this.formatLicense = (license) => {
    if (license.length === 0) return 'CC0';

    return `CC ${license.join('-')}`;
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
    let license = document.createElement('td');
    let tags = document.createElement('td');
    let info = document.createElement('td');

    //Add classes for styling
    this.el.classList.add('file');
    playButtonCell.className = 'play-button-cell';
    playButton.className = 'play-button';

    //Add attributes and innerHTML/textContent
    if (this.loading) playButton.innerHTML = loadingIcon;
    else playButton.innerHTML = this.playing ? pauseIcon : playIcon;
    id.textContent = data.id;
    name.textContent = data.name;
    artist.textContent = data.artist;
    type.textContent = data.type;
    fileType.textContent = data.format;
    license.textContent = this.formatLicense(data.license);
    tags.textContent = data.tags.join(', ');
    info.textContent = data.info;

    //Build structure
    this.el.appendChild(playButtonCell);
    this.el.appendChild(id);
    this.el.appendChild(name);
    this.el.appendChild(artist);
    this.el.appendChild(type);
    this.el.appendChild(fileType);
    this.el.appendChild(license);
    this.el.appendChild(tags);
    this.el.appendChild(info);
    data.format === 'wav' || data.format === 'mp3' ? playButtonCell.appendChild(playButton) : null;

    //Add listeners
    playButton.onclick = this.handlePlayButton;

    app.files.push(this); //Store file reference in global state
    return this.el;
  }
}

module.exports = File;
