'use strict';

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
    let content = document.createElement('pre');

    //Add classes for styling
    this.el.classList.add('comment');

    //Add attributes and innerHTML/textContent
    artist.textContent = this.data.artist + ':';
    content.textContent = this.data.content;

    //Build structure
    this.el.appendChild(artist);
    this.el.appendChild(content);

    //Add listeners
    artist.onclick = this.handleArtistClick;

    return this.el;
  }
}

module.exports = Comment;
