let Comment = require('./comment');

function Comments(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('hi');
  }

  this.render = () => {
    //Create elements
    const container = document.createElement('div');
    const marker = document.createElement('div');
    const textarea = document.createElement('textarea');
    const submit = document.createElement('button');

    //Add classes for styling
    this.el.className = 'comments';
    container.className = 'comment-container';
    marker.className = 'marker';

    //Add attributes and innerHTML
    submit.innerHTML = 'submit';
    textarea.setAttribute('rows', '1');
    textarea.setAttribute('autofocus', true);
    marker.innerHTML = '> '

    //Build structure
    for (let _comment of this.data) {
      let comment = new Comment(_comment);
      this.el.appendChild(comment.render());
    }

    this.el.appendChild(container);
    container.appendChild(marker);
    container.appendChild(textarea);
    container.appendChild(submit);

    //Add listeners
    submit.onclick = this.handleSubmit;

    return this.el;
  }
}

module.exports = Comments;
