let Comment = require('./comment');

function Comments(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    //Add classes for styling
    this.el.className = 'comments';

    for (let _comment of this.data) {
      let comment = new Comment(_comment);
      this.el.appendChild(comment.render());
    }

    return this.el;
  }
}

module.exports = Comments;
