function ActionBarAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    //Create elements
    let songs = document.createElement('button');
    let pin = document.createElement('button');
    let download = document.createElement('button');

    //Add classes for styling
    this.el.className = 'actions';

    //Add attributes and innerHTML
    songs.innerHTML = `${this.data.songs.length} songs`;
    pin.innerHTML = `pin`;
    download.innerHTML = 'download all';

    //Build structure
    this.el.appendChild(songs);
    this.el.appendChild(pin);
    this.el.appendChild(download);

    //Add listeners
    pin.onclick = (e) => {
      e.stopPropagation();
    }

    return this.el;
  }
}

module.exports = ActionBarAlbum;
