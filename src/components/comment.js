function Comment(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.handleArtistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    app.addToHistory('artist', { artist: this.data.artist });
    app.changeView('artist', { artist: this.data.artist });
  }

  this.render = () => {
    //Create elements
    let artist = document.createElement('button');
    let content = document.createElement('p');

    //Add classes for styling
    this.el.classList.add('comment');

    //Add attributes and innerHTML
    artist.innerHTML = this.data.artist + ':';
    content.innerHTML = this.data.content;

    //Build structure
    this.el.appendChild(artist);
    this.el.appendChild(content);

    //Add listeners
    artist.onclick = this.handleArtistClick;

    return this.el;
  }
}

module.exports = Comment;
