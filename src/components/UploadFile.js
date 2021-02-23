function UploadFile(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.render = () => {
    //Create elements
    let nameDiv = document.createElement('div');
    let nameLabel = document.createElement('label');
    let name = document.createElement('input');
    let tagsDiv = document.createElement('div');
    let tagsLabel = document.createElement('label');
    let tags = document.createElement('input');
    let fileDiv = document.createElement('div');
    let fileLabel = document.createElement('label');
    let file = document.createElement('input');

    //Add classes for styling
    this.el.className = 'upload-file';

    //Add attributes and innerHTML
    nameLabel.setAttribute('for', 'name');
    nameLabel.innerHTML = 'name:';
    name.setAttribute('type', 'text');
    name.setAttribute('name', 'name');
    tagsLabel.setAttribute('for', 'tags');
    tagsLabel.innerHTML = 'tags:';
    tags.setAttribute('type', 'text');
    tags.setAttribute('name', 'tags');
    fileLabel.setAttribute('for', 'tags');
    fileLabel.innerHTML = 'file:';
    file.setAttribute('type', 'file');
    file.setAttribute('name', 'file');

    //Build structure
    nameDiv.appendChild(nameLabel);
    nameDiv.appendChild(name);
    tagsDiv.appendChild(tagsLabel);
    tagsDiv.appendChild(tags);
    fileDiv.appendChild(fileLabel);
    fileDiv.appendChild(file);
    this.el.appendChild(nameDiv);
    this.el.appendChild(tagsDiv);
    this.el.appendChild(fileDiv);

    return app.content.appendChild(this.el);
  }
}

module.exports = UploadFile;
