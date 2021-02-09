function Header() {
  this.handleBack = () => {
    let index = client.historyIndex - 1;

    //Handle first item in list
    if (index < 0) {
      return console.log('at first index already');
    }

    let view = client.history[index];
    switch (view.type) {
      case 'song':
        client.historyIndex--;
        return client.changeView(view.type, view.data);
      default:
        client.historyIndex--;
        client.nav.select(view.type)
        return client.changeView(view.type);
    }
  }

  this.handleForward = () => {
    let index = client.historyIndex + 1;

    //Handle last item in list
    if (index > client.history.length - 1) {
      return console.log('at last index already')
    }

    let view = client.history[index];
    switch (view.type) {
      case 'song':
        client.historyIndex++;
        return client.changeView(view.type, view.data);
      default:
        client.historyIndex++;
        client.nav.select(view.type)
        return client.changeView(view.type);
    }
  }

  this.init = () => {
    let back = document.createElement('button');
    let forward = document.createElement('button');

    back.innerHTML = '<'
    forward.innerHTML = '>'

    back.onclick = this.handleBack;
    forward.onclick = this.handleForward;

    client.headerEl.appendChild(back);
    client.headerEl.appendChild(forward);
  }
}

module.exports = Header;
