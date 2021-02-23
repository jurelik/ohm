function Comment(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.render = () => {
    //Create elements
    let artist = document.createElement('p');
    let content = document.createElement('p');

    //Add classes for styling
    this.el.classList.add('comment');

    //Add attributes and innerHTML
    artist.innerHTML = data.artist + ':';
    content.innerHTML = data.content;

    //Build structure
    this.el.appendChild(artist);
    this.el.appendChild(content);

    //Add listeners

    return this.el;
  }
}

module.exports = Comment;
