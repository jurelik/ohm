'use strict';

const UploadFile = require('./UploadFile');

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
    this.el.insertBefore(uploadFile.render(), this.el.children[this.el.children.length - 2]);
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

  this.getSongData = () => {
    const song = Array.from(this.el.querySelectorAll('.song-input, .song-textarea')).reduce((acc, input) => {
      if (input.type === 'file' && input.files[0]) return { ...acc, path: input.files[0].path };

      return { ...acc, [input.name]: input.value };
    }, {});

    //Handle empty fields
    if (song.title === '') throw 'song title is missing'
    if (!song.path) throw 'song file is missing'
    if (song.tags === '') throw 'song tags are missing'

    //Add files
    song.files = [];
    for (let el of this.children) song.files.push(el.getFileData());

    //Add CID & format
    song.cid = null;
    song.format = song.path.slice(-3);

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
    title.className = 'song-input';
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
    tagsLabel.setAttribute('for', 'tags');
    tagsLabel.textContent = 'tags:';
    tags.setAttribute('type', 'text');
    tags.setAttribute('name', 'tags');
    fileLabel.setAttribute('for', 'tags');
    fileLabel.textContent = 'file:';
    file.setAttribute('type', 'file');
    file.setAttribute('name', 'file');
    file.setAttribute('accept', 'audio/mpeg');
    descriptionLabel.setAttribute('for', 'description');
    descriptionLabel.textContent = 'description:';
    descriptionDiv.className = 'upload-description';
    description.setAttribute('name', 'description');
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

    //Add listeners
    addFile.onclick = this.handleAddFile;
    deleteSong.onclick = this.handleDeleteSong;

    return this.el;
  }
}

module.exports = UploadSong;
