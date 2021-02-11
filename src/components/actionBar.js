function ActionBar(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    //Create elements
    let files = document.createElement('button');
    let comments = document.createElement('button');
    let pins = document.createElement('button');
    let download = document.createElement('button');

    //Add classes for styling
    this.el.className = 'actions';

    //Add attributes and innerHTML
    files.innerHTML = `${this.data.files.length} files`;
    comments.innerHTML = `${this.data.comments.length} comments`;
    pins.innerHTML = `${this.data.pins.length} pins`;
    download.innerHTML = 'download all';

    //Build structure
    this.el.appendChild(files);
    this.el.appendChild(comments);
    this.el.appendChild(pins);
    this.el.appendChild(download);

    //Add listeners
    comments.onclick = (e) => {
      e.stopPropagation();
      client.addToHistory('song', { song: this.data, action: 'comments' });
      client.changeView('song', { song: this.data, action: 'comments' });
    }

    return this.el;
  }
}

module.exports = ActionBar;
