function Header() {
  this.el = document.querySelector('.header');
  this.backIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="547.5 238.5 183 183"><path fill="none" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M669 255h0l-60 75 60 75"/><path fill="none" stroke="none" d="M547.5 238.5h183v183h-183z"/></svg></svg>';
  this.forwardIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="533.5 238.5 183 183"><path fill="none" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M595 255h0l60 75-60 75"/><path fill="none" stroke="none" d="M533.5 238.5h183v183h-183z"/></svg></svg>';
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
      default:
        app.historyIndex++;
        app.nav.select(view.type)
        return app.changeView(view.type);
    }
  }

  this.render = () => {
    //Create elements
    let back = document.createElement('button');
    let forward = document.createElement('button');
    let right = document.createElement('div');
    let upload = document.createElement('button');

    //Add innerHTML
    back.innerHTML = this.backIcon;
    forward.innerHTML = this.forwardIcon;
    upload.innerHTML = 'upload';

    //Add classes
    forward.classList.add('disabled');
    back.classList.add('disabled');
    right.classList.add('header-right');

    //Add listeners
    back.onclick = this.handleBack;
    forward.onclick = this.handleForward;

    //Create reference
    this.backButton = back;
    this.forwardButton = forward;

    this.el.appendChild(back);
    this.el.appendChild(forward);
    this.el.appendChild(right);
    right.appendChild(upload);
  }
}

module.exports = Header;
