const UploadFile = require('./UploadFile');

function UploadSong(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.handleAddFile = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.el.appendChild(new UploadFile().render());
  }

  this.render = () => {
    //Create elements
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

    //Add attributes and innerHTML
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
    this.el.appendChild(titleDiv);
    this.el.appendChild(tagsDiv);
    this.el.appendChild(fileDiv);
    this.el.appendChild(addFile);

    //Add listeners
    addFile.onclick = this.handleAddFile;

    return app.content.appendChild(this.el);
  }
}

module.exports = UploadSong;
