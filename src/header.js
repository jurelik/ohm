function Header() {
  this.handleBack = () => {
    let index = client.historyIndex - 1;
    if (index >= 0) {
      let view = client.history[index];

      switch (view.type) {
        case 'song':
          client.historyIndex --;
          return client.changeView(view.type, view.data);
        default:
          client.historyIndex --;
          client.nav.select(view.type)
          return client.changeView(view.type);
      }
    }

    return console.log('at last index already');
  }

  this.init = () => {
    let back = document.createElement('button');
    let forward = document.createElement('button');

    back.innerHTML = '<'
    forward.innerHTML = '>'

    back.onclick = this.handleBack;

    client.headerEl.appendChild(back);
    client.headerEl.appendChild(forward);
  }
}

module.exports = Header;
