const UploadSong = require('./UploadSong');
const UploadAlbum = require('./UploadAlbum');
const io = require('../utils/io');

function UploadView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.form = document.createElement('form');
  this.form.setAttribute('id', 'upload-form');
  this.children = [];
  this.album = null;
  this.fileCounter = 0;
  this.songCounter = 0;

  this.handleAddSong = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (this.children.length === 1) this.album.enable(); //Update album section

    let uploadSong = new UploadSong();
    this.children.push(uploadSong);
    this.form.appendChild(uploadSong.render());

    uploadSong.el.querySelector('input').focus(); //Focus first input
  }

  this.handleRemoveSong = (unique) => {
    if (this.children.length === 2) this.album.disable(); //Update album section

    //Find song to delete
    let song;
    this.children.some(child => {
      if (child.unique === unique) {
        song = child
        return true;
      }
    });
    let index = this.children.indexOf(song);

    this.form.removeChild(this.children[index].el);
    this.children.splice(index, 1);
  }

  this.handleSubmit = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    let payload = {
      album: null,
      songs: [],
      multiaddr: app.MULTIADDR, //Include multiaddr in payload
      unique: null,
    };
    if (this.children.length > 1) payload.album = this.album.getAlbumData(); //Include album data if more than one song
    for (let el of this.children) payload.songs.push(el.getSongData());

    try {
      console.log(payload);
      await io.upload(payload);
      console.log(payload);
    }
    catch (err) {
      console.error(err);
    }
  }

  this.display = () => {
    return app.content.appendChild(this.el);
  }

  this.render = () => {
    //Create elements
    let addSong = document.createElement('button');
    let submit = document.createElement('input');
    this.album = new UploadAlbum();
    let album = this.album.render();

    //Add classes for styling
    this.el.className = 'upload';

    //Add attributes and innerHTML
    addSong.innerHTML = 'add song';
    submit.innerHTML = 'submit';
    submit.setAttribute('type', 'submit');

    //Build structure
    this.el.appendChild(this.form);
    this.form.appendChild(album);
    this.el.appendChild(addSong);
    this.el.appendChild(submit);

    if (this.children.length === 0) {
      let uploadSong = new UploadSong();
      this.children.push(uploadSong);
      this.form.appendChild(uploadSong.render());
    }

    //Add listeners
    addSong.onclick = this.handleAddSong;
    submit.onclick = this.handleSubmit;

    app.content.appendChild(this.el);
    return this.children[0].el.querySelector('input').focus(); //Focus the first input
  }
}

module.exports = UploadView;
