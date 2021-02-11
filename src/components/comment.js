function Comment(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    //Create elements
    let content = document.createElement('p');

    //Add classes for styling
    this.el.classList.add('comment');

    //Add attributes and innerHTML
    content.innerHTML = data;

    //Build structure
    this.el.appendChild(content);

    //Add listeners

    return this.el;
  }
}

module.exports = Comment;
