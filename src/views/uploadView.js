'use strict';

const fs = require('fs');
const path = require('path');
const UploadSong = require('../components/uploadSong');
const UploadAlbum = require('../components/uploadAlbum');
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
  this.submitting = false; //Prevent submitting twice

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
        song = child;
        return true;
      }
    });
    let index = this.children.indexOf(song);

    this.form.removeChild(this.children[index].el);
    this.children.splice(index, 1);
  }

  this.handleSave = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    const home = require('os').homedir();
    const data = {
      album: null,
      songs: []
    }

    try {
      if (this.children.length > 1) data.album = this.album.getAlbumData(true);
      for (const child of this.children) data.songs.push(child.getSongData(true));

      await fs.promises.mkdir(path.join(home, '/Documents/ohm-save'), { recursive: true });
      fs.writeFileSync(path.join(home, `Documents/ohm-save`, `test.sav`), JSON.stringify(data, null, 2));
    }
    catch (err) {
      log(err.message);
    }
  }

  this.handleLoad = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const home = require('os').homedir();

    try {
      const data = JSON.parse(fs.readFileSync(path.join(home, `Documents/ohm-save`, `test.sav`)));

      this.reset(true); //Reset view
      for (const song of data.songs) {
        let uploadSong = new UploadSong(song);
        this.children.push(uploadSong);
        this.form.appendChild(uploadSong.render());
      }
    }
    catch (err) {
      log(err.message);
    }
  }

  this.handleSubmit = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (this.submitting) return log.error('Already uploading.');

    const spinner = this.addSpinner(); //Add spinner
    this.submitting = true;

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
      log.error(err.message);
      this.submitting = false;
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
    this.el.querySelector('.percentage').textContent = `${progress}%`;
  }

  this.display = () => {
    app.content.innerHTML = '';
    return app.content.appendChild(this.el);
  }

  this.reset = (loadFromSave) => { //Reset state and re-render if applicable
    this.el.innerHTML = '';
    this.form.innerHTML = '';
    this.children = [];
    this.album = null;
    this.fileCounter = 0;
    this.songCounter = 0;
    this.submitting = false;
    app.content.scrollTop = 0;
    if (app.current === 'upload') this.render(loadFromSave); //Re-render view if still in uploadView
    else app.views.upload = null; //Reset otherwise
  }

  this.render = (loadFromSave) => {
    //Create elements
    let bottomBar = document.createElement('div');
    let addSong = document.createElement('button');
    let load = document.createElement('button');
    let save = document.createElement('button');
    let submitDiv = document.createElement('div');
    let submit = document.createElement('input');
    this.album = new UploadAlbum();
    let album = this.album.render();

    //Add classes for styling
    this.el.className = 'upload';
    bottomBar.className = 'upload-bottom-bar';
    submitDiv.className = 'submit-div';
    addSong.className = 'add-song';

    //Add attributes and innerHTML/textContent
    addSong.textContent = 'add song';
    load.textContent = 'load';
    save.textContent = 'save';
    submit.setAttribute('type', 'submit');
    submit.setAttribute('value', 'submit');

    //Build structure
    this.el.appendChild(this.form);
    this.form.appendChild(album);
    this.el.appendChild(bottomBar);
    bottomBar.appendChild(addSong);
    bottomBar.appendChild(load);
    bottomBar.appendChild(save);
    bottomBar.appendChild(submitDiv);
    submitDiv.appendChild(submit);

    if (this.children.length === 0 && !loadFromSave) { //Don't create new uploadSong if we are loading a save file
      let uploadSong = new UploadSong();
      this.children.push(uploadSong);
      this.form.appendChild(uploadSong.render());
    }

    //Add listeners
    addSong.onclick = this.handleAddSong;
    load.onclick = this.handleLoad;
    save.onclick = this.handleSave;
    submit.onclick = this.handleSubmit;

    app.content.innerHTML = '';
    app.content.appendChild(this.el);
    if (!loadFromSave) return this.children[0].el.querySelector('input').focus(); //Focus the first input
  }
}

module.exports = UploadView;
