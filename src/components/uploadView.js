const UploadSong = require('./UploadSong');
const UploadAlbum = require('./UploadAlbum');
const ipfs = require('../utils/ipfs');

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
      songs: []
    };
    let writtenToMFS = false; //Keep track of whether or not MFS has been modified for error handling
    let unique = null;

    try {
      if (this.children.length > 1) payload.album = this.album.getAlbumData(); //Include album data if more than one song
      for (let el of this.children) payload.songs.push(el.getSongData());

      if (payload.album) {
        unique = await ipfs.uploadAlbum(payload);
      }
      else {
        unique = await ipfs.uploadSingle(payload);
      }

      writtenToMFS = true; //MFS has been modified
      //Send payload to server
      const _res = await fetch(`${app.URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const res = await _res.json();
      if (res.type === 'error') throw res.err;
      app.transfersStore.update(unique, { completed: true }); //Update status of transfer to completed
      console.log(app.transfersStore.get());
    }
    catch (err) {
      if (err === 'album with the same name already exists') return console.log(err);
      if (err === 'single with the same name already exists') return console.log(err);

      console.log(err);
      if (payload.album && writtenToMFS) await app.ipfs.files.rm(`/antik/albums/${payload.album.title}`, { recursive: true });
      else if (payload.songs.length > 0 && writtenToMFS) await app.ipfs.files.rm(`/antik/singles/${payload.songs[0].title}`, { recursive: true });
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
