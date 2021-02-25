const UploadSong = require('./UploadSong');
const UploadAlbum = require('./UploadAlbum');

function UploadView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.form = document.createElement('form');
  this.form.setAttribute('id', 'upload-form');
  this.children = [];
  this.album = null;
  this.fileCounter = 0;

  this.handleAddSong = (e) => {
    e.stopPropagation();

    //Update album section
    if (this.children.length === 1) this.album.enable();

    let uploadSong = new UploadSong();
    this.children.push(uploadSong);
    this.form.appendChild(uploadSong.render());

    uploadSong.el.querySelector('input').focus(); //Focus first input
  }

  this.handleRemoveSong = (e) => {
    e.stopPropagation();

    //Update album section
    if (this.children.length === 2) this.album.disable();

    this.form.removeChild(this.children[this.children.length - 1].el);
    this.children.pop();
  }

  this.handleSubmit = (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      let payload = {
        album: null,
        songs: []
      };

      if (this.children.length > 1) payload.album = this.album.getAlbumData(); //Include album data if more than one song
      for (let el of this.children) payload.songs.push(el.getSongData());
      console.log(payload);
    }
    catch (err) {
      console.log(err);
    }
  }

  this.display = () => {
    return app.content.appendChild(this.el);
  }

  this.render = () => {
    //Create elements
    let addSong = document.createElement('button');
    let removeSong = document.createElement('button');
    let submit = document.createElement('input');
    this.album = new UploadAlbum();
    let album = this.album.render();

    //Add classes for styling
    this.el.className = 'upload';

    //Add attributes and innerHTML
    addSong.innerHTML = 'add song';
    removeSong.innerHTML = 'remove song';
    submit.innerHTML = 'submit';
    submit.setAttribute('type', 'submit');

    //Build structure
    this.el.appendChild(this.form);
    this.form.appendChild(album);
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

    app.content.appendChild(this.el);
    return this.children[0].el.querySelector('input').focus(); //Focus the first input
  }
}

module.exports = UploadView;
