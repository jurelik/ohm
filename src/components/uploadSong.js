'use strict';

const UploadFile = require('./uploadFile');
const helpers = require('../utils/helpers');
const log = require('../utils/log');

function UploadSong(data) {
  this.el = document.createElement('fieldset');
  this.data = data;
  this.children = [];

  //Add unique id to file and increase songCounter
  this.unique = app.views.upload.songCounter;
  app.views.upload.songCounter++;

  this.handleAddFile = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let uploadFile = new UploadFile({ handleRemoveFile: this.handleRemoveFile });
    this.children.push(uploadFile);
    this.el.insertBefore(uploadFile.render(), this.el.children[this.el.children.length - 3]);
  }

  this.handleDragEnter = (e) => {
    e.stopPropagation();
    e.preventDefault();

    this.el.querySelector('.song-overlay').style.visibility = "visible";
  }

  this.handleDragLeave = (e) => {
    this.el.querySelector('.song-overlay').style.visibility = "hidden";
  }

  this.handleFileDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const file = this.el.querySelector('input[type=file]');
    const title = this.el.querySelector('.title');

    this.el.querySelector('.song-overlay').style.visibility = "hidden";

    //Check file extension
    const extension = e.dataTransfer.files[0].name.slice(-3);
    if (extension !== 'mp3') {
      file.value = null;
      return log.error('Only mp3 files allowed.');
    }

    file.files = e.dataTransfer.files;
    if (title.value === '') title.value = e.dataTransfer.files[0].name.slice(0, -4);
  }

  this.handleDeleteSong = (e) => {
    e.preventDefault();
    e.stopPropagation();

    return app.views.upload.handleRemoveSong(this.unique);
  }

  this.handleRemoveFile = (unique) => {
    //Find file to delete
    let file;
    this.children.some(child => {
      if (child.unique === unique) {
        file = child
        return true;
      }
    });
    let index = this.children.indexOf(file);

    this.el.removeChild(this.children[index].el);
    this.children.splice(index, 1);
  }

  this.getSongData = (shallow) => {
    const song = Array.from(this.el.querySelectorAll('.song-input, .song-textarea')).reduce((acc, input) => {
      if (input.type === 'file' && input.files[0]) return { ...acc, path: input.files[0].path };

      return { ...acc, [input.name]: input.value };
    }, {});

    //Handle empty fields
    if (song.title === '') throw new Error('Song title is missing.');
    if (!song.path) throw new Error('Song file is missing.');
    if (song.tags === '') throw new Error('Song tags are missing.');

    song.tags = song.tags.split(/[,;]+/).filter(tag => tag.length > 0); //Turn tags into an array
    if (song.tags.length === 0) throw new Error('Song tags are missing');

    //Check formatting
    if (!helpers.allowedFormat(song.title)) throw new Error('Song title can only include letters, numbers and underscores.'); //Check for bad characters
    for (let tag of song.tags) {
      if (!helpers.allowedFormat(tag)) throw new Error('Tags can only include letters, numbers and underscores.');
    }

    //Add files
    song.files = [];
    for (let el of this.children) song.files.push(el.getFileData(shallow));

    //Add CID & format
    if (!shallow) {
      song.cid = null;
      song.format = song.path.slice(-3);
    }

    return song;
  }

  this.render = () => {
    //Create elements
    let legend = document.createElement('legend');
    let titleDiv = document.createElement('div');
    let titleLabel = document.createElement('label');
    let title = document.createElement('input');
    let tagsDiv = document.createElement('div');
    let tagsLabel = document.createElement('label');
    let tags = document.createElement('input');
    let fileDiv = document.createElement('div');
    let fileLabel = document.createElement('label');
    let file = document.createElement('input');
    let descriptionDiv = document.createElement('div');
    let descriptionLabel = document.createElement('label');
    let description = document.createElement('textarea');
    let addFile = document.createElement('button');
    let deleteSong = document.createElement('button');

    //Add classes for styling
    this.el.className = 'upload-song';
    title.classList.add('song-input', 'title');
    titleDiv.className = 'song-title-div';
    tags.className = 'song-input';
    tagsDiv.className = 'song-tags-div';
    file.className = 'song-input';
    fileDiv.className = 'song-file-div';
    description.className = 'song-textarea';

    //Add attributes and innerHTML/textContent
    legend.textContent = 'song:';
    titleLabel.setAttribute('for', 'title');
    titleLabel.textContent = 'title:';
    title.setAttribute('type', 'text');
    title.setAttribute('name', 'title');
    if (this.data && this.data.title) title.setAttribute('value', this.data.title);

    tagsLabel.setAttribute('for', 'tags');
    tagsLabel.textContent = 'tags:';
    tags.setAttribute('type', 'text');
    tags.setAttribute('name', 'tags');
    if (this.data && this.data.tags) tags.setAttribute('value', this.data.tags.join(', '));

    fileLabel.setAttribute('for', 'tags');
    fileLabel.textContent = 'file:';
    file.setAttribute('type', 'file');
    file.setAttribute('name', 'file');
    file.setAttribute('accept', 'audio/mpeg');

    descriptionLabel.setAttribute('for', 'description');
    descriptionLabel.textContent = 'description:';
    descriptionDiv.className = 'upload-description';
    description.setAttribute('name', 'description');
    if (this.data && this.data.description) description.textContent = this.data.description;

    addFile.textContent = 'add file';
    deleteSong.textContent = 'delete song';

    //Build structure
    titleDiv.appendChild(titleLabel);
    titleDiv.appendChild(title);
    tagsDiv.appendChild(tagsLabel);
    tagsDiv.appendChild(tags);
    fileDiv.appendChild(fileLabel);
    fileDiv.appendChild(file);
    descriptionDiv.appendChild(descriptionLabel);
    descriptionDiv.appendChild(description);
    this.el.appendChild(legend);
    this.el.appendChild(titleDiv);
    this.el.appendChild(tagsDiv);
    this.el.appendChild(fileDiv);
    this.el.appendChild(descriptionDiv);
    this.el.appendChild(addFile);
    this.el.appendChild(deleteSong);

    //Add drag & drop overlay
    const overlay = document.createElement('div');
    overlay.className = 'song-overlay';
    this.el.appendChild(overlay);

    //Add files if loading from a save file
    if (this.data && this.data.files.length > 0) {
      for (const file of this.data.files) {
        let uploadFile = new UploadFile({ file, handleRemoveFile: this.handleRemoveFile });
        this.children.push(uploadFile);
        this.el.insertBefore(uploadFile.render(), this.el.children[this.el.children.length - 3]);
      }
    }

    //Add listeners
    addFile.onclick = this.handleAddFile;
    this.el.ondragenter = this.handleDragEnter;
    overlay.ondragenter = (e) => e.preventDefault();
    overlay.ondragover = (e) => e.preventDefault();
    overlay.ondragleave = this.handleDragLeave;
    overlay.ondrop = this.handleFileDrop;
    deleteSong.onclick = this.handleDeleteSong;

    return this.el;
  }
}

module.exports = UploadSong;
