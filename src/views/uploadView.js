const UploadSong = require('../components/UploadSong');
const UploadAlbum = require('../components/UploadAlbum');
const io = require('../utils/io');
const log = require('../utils/log');

function UploadView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.form = document.createElement('form');
  this.form.setAttribute('id', 'upload-form');
  this.children = [];
  this.album = null;
  this.fileCounter = 0;
  this.songCounter = 0;
  this.progress = null;

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

    const spinner = this.addSpinner(); //Add spinner

    try {
      let payload = {
        album: null,
        songs: [],
        multiaddr: app.MULTIADDR, //Include multiaddr in payload
      };
      if (this.children.length > 1) payload.album = this.album.getAlbumData(); //Include album data if more than one song
      for (let el of this.children) payload.songs.push(el.getSongData());

      log('Beginning upload.')
      await io.upload(payload);
      log.success('Successfully uploaded.');
      return this.reset();
    }
    catch (err) {
      log.error(err);
      spinner.remove();
    }
  }

  this.addSpinner = () => {
    const submitDiv = this.el.querySelector('.submit-div');
    const spinner = document.createElement('div');
    const percentage = document.createElement('div');
    spinner.className = 'spinner';
    percentage.className = 'percentage';
    submitDiv.insertBefore(spinner, submitDiv.childNodes[0]);
    submitDiv.insertBefore(percentage, submitDiv.childNodes[0]);

    return spinner;
  }

  this.updateProgress = (progress) => {
    this.el.querySelector('.percentage').innerHTML = `${progress}%`;
  }

  this.display = () => {
    app.content.innerHTML = '';
    return app.content.appendChild(this.el);
  }

  this.reset = () => { //Reset state and re-render if applicable
    this.el.innerHTML = '';
    this.form.innerHTML = '';
    this.children = [];
    this.album = null;
    this.fileCounter = 0;
    this.songCounter = 0;
    if (app.current === 'upload') this.render(); //Re-render view if still in uploadView
    else app.views.upload = null; //Reset otherwise
  }

  this.render = () => {
    //Create elements
    let bottomBar = document.createElement('div');
    let addSong = document.createElement('button');
    let submitDiv = document.createElement('div');
    let submit = document.createElement('input');
    this.album = new UploadAlbum();
    let album = this.album.render();

    //Add classes for styling
    this.el.className = 'upload';
    bottomBar.className = 'upload-bottom-bar';
    submitDiv.className = 'submit-div';
    addSong.className = 'add-song';

    //Add attributes and innerHTML
    addSong.innerHTML = 'add song';
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'submit');

    //Build structure
    this.el.appendChild(this.form);
    this.form.appendChild(album);
    this.el.appendChild(bottomBar);
    bottomBar.appendChild(addSong);
    bottomBar.appendChild(submitDiv);
    submitDiv.appendChild(submit);

    if (this.children.length === 0) {
      let uploadSong = new UploadSong();
      this.children.push(uploadSong);
      this.form.appendChild(uploadSong.render());
    }

    //Add listeners
    addSong.onclick = this.handleAddSong;
    submit.onclick = this.handleSubmit;

    app.content.innerHTML = '';
    app.content.appendChild(this.el);
    return this.children[0].el.querySelector('input').focus(); //Focus the first input
  }
}

module.exports = UploadView;
