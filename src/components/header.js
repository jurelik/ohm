const ipfs = require('../utils/ipfs');
const log = require('../utils/log');

function Header() {
  this.el = document.querySelector('.header');
  this.backIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="598.5 268.5 183 183"><path fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M720 285h0l-60 75 60 75"/><path fill="none" stroke="none" d="M598.5 268.5h183v183h-183v-183z"/></svg>';
  this.forwardIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="478.5 233.5 183 183"><path fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M540 250h0l60 75-60 75"/><path fill="none" stroke="none" d="M478.5 233.5h183v183h-183v-183z"/></svg>';
  this.refreshIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="598 269 183 183"><path fill="none" stroke-width="20" stroke-linecap="round" stroke-linejoin="round" d="M751.321 298.679h0v42.427h-42.427m21.214-21.213c-23.432-23.432-61.422-23.432-84.854 0h0c-23.432 23.432-23.431 61.421 0 84.853h0c23.432 23.432 61.421 23.432 84.854 0h0m21.213-63.64h0l-21.213-21.213"/><path fill="none" d="M598 269h183v183H598V269z"/></svg></svg>'
  this.backButton = null;
  this.forwardButton = null;

  this.handleBack = () => {
    let index = app.historyIndex - 1;

    //Handle first item in list
    if (index < 0) {
      return console.log('at first index already');
    }

    //Handle index at 0
    if (index === 0) this.backButton.className = 'disabled';

    this.forwardButton.className = 'enabled';
    let view = app.history[index];

    switch (view.type) {
      case 'song':
        app.historyIndex--;
        return app.changeView(view.type, view.data);
      case 'album':
        app.historyIndex--;
        return app.changeView(view.type, view.data);
      case 'artist':
        app.historyIndex--;
        return app.changeView(view.type, view.data);
      case 'upload':
        app.historyIndex--;
        return app.changeView(view.type, view.data);
      default:
        app.historyIndex--;
        app.nav.select(view.type)
        return app.changeView(view.type, view.data);
    }
  }

  this.handleForward = () => {
    let index = app.historyIndex + 1;

    //Handle last item in list
    if (index > app.history.length - 1) {
      return console.log('at last index already')
    }

    //Handle index at last position
    if (index === app.history.length - 1) {
      this.forwardButton.className = 'disabled';
    }

    this.backButton.className = 'enabled';
    let view = app.history[index];
    switch (view.type) {
      case 'song':
        app.historyIndex++;
        return app.changeView(view.type, view.data);
      case 'album':
        app.historyIndex++;
        return app.changeView(view.type, view.data);
      case 'artist':
        app.historyIndex++;
        return app.changeView(view.type, view.data);
      case 'upload':
        app.historyIndex++;
        return app.changeView(view.type, view.data);
      default:
        app.historyIndex++;
        app.nav.select(view.type)
        return app.changeView(view.type);
    }
  }

  this.handleRefresh = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (app.views[app.current].refresh) app.views[app.current].refresh();
  }

  this.handleTest = async () => {
    log(app.current)
  }

  this.handleUpload = () => {
    app.addToHistory('upload');
    return app.changeView('upload');
  }

  this.render = () => {
    //Create elements
    let back = document.createElement('button');
    let forward = document.createElement('button');
    let refresh = document.createElement('button');
    let right = document.createElement('div');
    let upload = document.createElement('button');
    let test = document.createElement('button');

    //Add innerHTML
    back.innerHTML = this.backIcon;
    forward.innerHTML = this.forwardIcon;
    refresh.innerHTML = this.refreshIcon;
    upload.innerHTML = 'upload';
    test.innerHTML = 'test';

    //Add classes
    forward.classList.add('disabled');
    back.classList.add('disabled');
    refresh.className = 'refresh';
    right.classList.add('header-right');

    //Add listeners
    back.onclick = this.handleBack;
    forward.onclick = this.handleForward;
    refresh.onclick = this.handleRefresh;
    upload.onclick = this.handleUpload;
    test.onclick = this.handleTest;

    //Create reference
    this.backButton = back;
    this.forwardButton = forward;

    this.el.appendChild(back);
    this.el.appendChild(forward);
    this.el.appendChild(refresh);
    this.el.appendChild(right);
    right.appendChild(upload);
    right.appendChild(test);
  }
}

module.exports = Header;
