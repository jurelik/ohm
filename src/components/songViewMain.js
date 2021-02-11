const Files = require('./files');
const Comments = require('./comments');

function SongViewMain(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.state = {};

  this.render = () => {
    switch (this.action) {
      case 'files':
        let files = new Files(data.files);
        return this.el.appendChild(files.render());
      case 'comments':
        let comments = new Comments(data.comments);
        return this.el.appendChild(comments.render());
      default:
        return console.error('wrong action');
    }
  }
}

module.exports = SongViewMain;
