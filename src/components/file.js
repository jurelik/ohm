function File(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    //Create elements
    let name = document.createElement('p');
    let artist = document.createElement('p');
    let playButton = document.createElement('button');

    //Add classes for styling
    this.el.classList.add('file');

    //Add attributes and innerHTML
    name.innerHTML = data.name;
    artist.innerHTML = data.artist;
    playButton.innerHTML = 'play/pause';

    //Build structure
    this.el.appendChild(artist);
    this.el.appendChild(name);
    this.el.appendChild(playButton);

    //Add listeners
    playButton.onclick = () => app.player.queueFile(data);

    return this.el;
  }
}

module.exports = File;
