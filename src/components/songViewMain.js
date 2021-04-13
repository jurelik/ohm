const Files = require('./files');
const Comments = require('./comments');
const Delete = require('./delete');

function SongViewMain(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;

  this.handleFilesClick = () => {
    if (this.action === 'files') return;
    this.action = 'files';
    this.el.innerHTML = '';
    app.views.songView.el.className = 'song-view-files'; //Change className of songView to account for comment bar height
    this.render();
  }

  this.handleCommentsClick = () => {
    if (this.action === 'comments') return;
    this.action = 'comments';
    this.el.innerHTML = '';
    app.views.songView.el.className = 'song-view-comments'; //Change className of songView to account for comment bar height
    this.render();
  }

  this.handleDeleteClick = () => {
    if (this.action === 'delete') return;
    this.action = 'delete';
    this.el.innerHTML = '';
    app.views.songView.el.className = 'song-view-delete'; //Change className of songView to account for comment bar height
    this.render();
  }

  this.appendActionBarDelete = (actionBar) => {
    let actionBarDelete = document.createElement('button');
    actionBarDelete.innerHTML = 'delete';
    actionBar.appendChild(actionBarDelete);
    actionBarDelete.onclick = this.handleDeleteClick;

    return actionBarDelete;
  }

  this.render = () => {
    //Create elements
    let actionBar = document.createElement('div');
    let actionBarFiles = document.createElement('button');
    let actionBarComments = document.createElement('button');
    let actionBarDelete;

    //Add classes for styling
    this.el.classList.add('song-view-main');

    //Add attributes and innerHTML
    actionBarFiles.innerHTML = 'files';
    actionBarComments.innerHTML = 'comments';

    //Build structure
    this.el.appendChild(actionBar);
    actionBar.appendChild(actionBarFiles);
    actionBar.appendChild(actionBarComments);

    //Append delete option if applicable
    if (app.artist === this.data.artist && !this.data.albumTitle) actionBarDelete = this.appendActionBarDelete(actionBar);

    //Add listeners
    actionBarFiles.onclick = this.handleFilesClick;
    actionBarComments.onclick = this.handleCommentsClick;

    switch (this.action) {
      case 'files':
        let files = new Files(data.files);
        this.el.appendChild(files.render());
        actionBarFiles.className = 'selected';
        break;
      case 'comments':
        let comments = new Comments(data.comments);
        this.el.appendChild(comments.render());
        comments.el.querySelector('textarea').focus(); //Focus the input
        actionBarComments.className = 'selected';
        break;
      case 'delete':
        let _delete = new Delete(data);
        this.el.appendChild(_delete.render());
        actionBarDelete.className = 'selected';
        break;
      default:
        console.error('wrong action');
        break;
    }

    return this.el;
  }
}

module.exports = SongViewMain;
