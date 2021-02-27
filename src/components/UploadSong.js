const UploadFile = require('./UploadFile');

function UploadSong(data) {
  this.el = document.createElement('fieldset');
  this.data = data;
  this.children = [];

  this.handleAddFile = (e) => {
    e.preventDefault();
    e.stopPropagation();

    let uploadFile = new UploadFile();
    this.children.push(uploadFile);
    this.el.appendChild(uploadFile.render());
  }

  this.getSongData = () => {
    const song = Array.from(this.el.querySelectorAll('.song-input')).reduce((acc, input) => {
      if (input.type === 'file') return { ...acc, [input.name]: input.files[0] };

      return { ...acc, [input.name]: input.value };
    }, {});

    //Handle empty fields
    if (song.title === '') throw 'song title is missing'
    if (!song.file) throw 'song file is missing'
    if (song.tags === '') throw 'song tags are missing'

    song.files = [];
    for (let el of this.children) song.files.push(el.getFileData());

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
    let addFile = document.createElement('button');

    //Add classes for styling
    this.el.className = 'upload-song';
    title.className = 'song-input';
    tags.className = 'song-input';
    file.className = 'song-input';

    //Add attributes and innerHTML
    legend.innerHTML = 'song: ';
    titleLabel.setAttribute('for', 'title');
    titleLabel.innerHTML = 'title:';
    title.setAttribute('type', 'text');
    title.setAttribute('name', 'title');
    tagsLabel.setAttribute('for', 'tags');
    tagsLabel.innerHTML = 'tags:';
    tags.setAttribute('type', 'text');
    tags.setAttribute('name', 'tags');
    fileLabel.setAttribute('for', 'tags');
    fileLabel.innerHTML = 'file:';
    file.setAttribute('type', 'file');
    file.setAttribute('name', 'file');
    addFile.innerHTML = 'add file';

    //Build structure
    titleDiv.appendChild(titleLabel);
    titleDiv.appendChild(title);
    tagsDiv.appendChild(tagsLabel);
    tagsDiv.appendChild(tags);
    fileDiv.appendChild(fileLabel);
    fileDiv.appendChild(file);
    this.el.appendChild(legend);
    this.el.appendChild(titleDiv);
    this.el.appendChild(tagsDiv);
    this.el.appendChild(fileDiv);
    this.el.appendChild(addFile);

    //Add listeners
    addFile.onclick = this.handleAddFile;

    return this.el;
  }
}

module.exports = UploadSong;
