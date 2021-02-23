const UploadSong = require('./UploadSong');

function UploadView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.form = document.createElement('form');
  this.elements = [];

  this.handleAddSong = (e) => {
    e.stopPropagation();

    let uploadSong = new UploadSong();
    this.elements.push(uploadSong);
    this.form.appendChild(uploadSong.render());
  }

  this.handleRemoveSong = (e) => {
    e.stopPropagation();

    this.form.removeChild(this.elements[this.elements.length - 1].el);
    this.elements.pop();
  }

  this.render = () => {
    //Create elements
    let addSong = document.createElement('button');
    let removeSong = document.createElement('button');

    //Add classes for styling
    this.el.className = 'upload';

    //Add attributes and innerHTML
    addSong.innerHTML = 'add song';
    removeSong.innerHTML = 'remove song';

    //Build structure
    this.el.appendChild(this.form);
    this.el.appendChild(addSong);
    this.el.appendChild(removeSong);

    if (this.elements.length === 0) {
      let uploadSong = new UploadSong();
      this.elements.push(uploadSong);
      this.form.appendChild(uploadSong.render());
    }

    //Add listeners
    addSong.onclick = this.handleAddSong;
    removeSong.onclick = this.handleRemoveSong;

    return app.content.appendChild(this.el);
  }
}

module.exports = UploadView;
