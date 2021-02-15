function ActionBarAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    //Create elements
    let songs = document.createElement('button');
    let comments = document.createElement('button');
    let download = document.createElement('button');

    //Add classes for styling
    this.el.className = 'actions';

    //Add attributes and innerHTML
    songs.innerHTML = `${this.data.songs.length} songs`;
    //comments.innerHTML = `${this.data.comments.length} comments`;
    download.innerHTML = 'download all';

    //Build structure
    this.el.appendChild(songs);
    this.el.appendChild(comments);
    this.el.appendChild(download);

    //Add listeners
    comments.onclick = (e) => {
      e.stopPropagation();
      app.addToHistory('album', { album: this.data, action: 'comments' });
      app.changeView('album', { album: this.data, action: 'comments' });
    }

    return this.el;
  }
}

module.exports = ActionBarAlbum;
