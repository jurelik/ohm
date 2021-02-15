const Song = require('./song');

function AlbumViewMain() {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.state = {};

  this.render = () => {
    //Create elements
    let actionBar = document.createElement('div');
    let actionBarFiles = document.createElement('button');
    let actionBarComments = document.createElement('button');
    let actionBarPins = document.createElement('button');

    //Add classes for styling
    this.el.classList.add('song-view-main');

    //Add attributes and innerHTML
    actionBarFiles.innerHTML = 'files';
    actionBarComments.innerHTML = 'comments';
    actionBarPins.innerHTML = 'pins';

    //Build structure
    this.el.appendChild(actionBar);
    actionBar.appendChild(actionBarFiles);
    actionBar.appendChild(actionBarComments);
    actionBar.appendChild(actionBarPins);

    //Add listeners
    actionBarFiles.onclick = () => {
      if (this.action === 'files') return;
      this.action = 'files';
      this.el.innerHTML = '';
      this.render();
    }

    actionBarComments.onclick = () => {
      if (this.action === 'comments') return;
      this.action = 'comments';
      this.el.innerHTML = '';
      this.render();
    }

    switch (this.action) {
      case 'files':
        let files = new Files(data.files);
        this.el.appendChild(files.render());
        actionBarFiles.className = 'selected';
        break;
      case 'comments':
        let comments = new Comments(data.comments);
        this.el.appendChild(comments.render());
        actionBarComments.className = 'selected';
        break;
      default:
        console.error('wrong action');
        break;
    }

    return this.el;
  }

}

module.exports = AlbumViewMain;
