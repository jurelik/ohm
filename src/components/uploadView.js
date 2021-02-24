const UploadSong = require('./UploadSong');

function UploadView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.form = document.createElement('form');
  this.form.setAttribute('id', 'upload-form');
  this.children = [];

  this.handleAddSong = (e) => {
    e.stopPropagation();

    let uploadSong = new UploadSong();
    this.children.push(uploadSong);
    this.form.appendChild(uploadSong.render());
  }

  this.handleRemoveSong = (e) => {
    e.stopPropagation();

    this.form.removeChild(this.children[this.children.length - 1].el);
    this.children.pop();
  }

  this.handleSubmit = (e) => {
    e.stopPropagation();
    e.preventDefault();

    for (let el of this.children) {
      console.log(el.getSongData());
    }

  }

  this.render = () => {
    //Create elements
    let addSong = document.createElement('button');
    let removeSong = document.createElement('button');
    let submit = document.createElement('input');

    //Add classes for styling
    this.el.className = 'upload';

    //Add attributes and innerHTML
    addSong.innerHTML = 'add song';
    removeSong.innerHTML = 'remove song';
    submit.innerHTML = 'submit';
    submit.setAttribute('type', 'submit');

    //Build structure
    this.el.appendChild(this.form);
    this.el.appendChild(addSong);
    this.el.appendChild(removeSong);
    this.el.appendChild(submit);

    if (this.children.length === 0) {
      let uploadSong = new UploadSong();
      this.children.push(uploadSong);
      this.form.appendChild(uploadSong.render());
    }

    //Add listeners
    addSong.onclick = this.handleAddSong;
    removeSong.onclick = this.handleRemoveSong;
    submit.onclick = this.handleSubmit;

    return app.content.appendChild(this.el);
  }
}

module.exports = UploadView;
