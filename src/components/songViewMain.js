const Files = require('./files');
const Comments = require('./comments');
const Delete = require('./delete');

function SongViewMain(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;

  this.render = () => {
    this.el.innerHTML = '';
    //Create elements

    //Add classes for styling
    this.el.className = 'song-view-main';

    //Add attributes and innerHTML

    //Build structure

    //Add listeners

    switch (this.action) {
      case 'files':
        let files = new Files(data.files);
        this.el.appendChild(files.render());
        break;
      case 'comments':
        let comments = new Comments(data.comments);
        this.el.appendChild(comments.render());
        comments.el.querySelector('textarea').focus(); //Focus the input
        break;
      default:
        console.error('wrong action');
        break;
    }

    return this.el;
  }
}

module.exports = SongViewMain;
