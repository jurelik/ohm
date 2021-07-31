'use strict';

const log = require('../utils/log');
const Files = require('./files');
const Comments = require('./comments');

function SongViewMain(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;

  this.reRender = (action) => {
    if (action === this.action) return; //Ignore if we are already on the same view
    this.el.innerHTML = '';
    this.action = action;
    app.history[app.historyIndex].data.action = action; //Modify history
    app.views[app.current].action = action; //Modify action value in view to handle refresh correctly
    app.views.song.el.className = `song-view-${action}`; //Change songView el className appropriately
    this.render();
  }

  this.render = () => {
    this.el.className = 'song-view-main';

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
        log.error('wrong action');
        break;
    }

    return this.el;
  }
}

module.exports = SongViewMain;
