function UploadAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.enable = () => {
    let inputs = this.el.querySelectorAll('input');
    let labels = this.el.querySelectorAll('label');

    for (let input of inputs) input.disabled = false;
    for (let label of labels) label.className = '';
  }

  this.disable = () => {
    let inputs = this.el.querySelectorAll('input');
    let labels = this.el.querySelectorAll('label');

    for (let input of inputs) input.disabled = true;
    for (let label of labels) label.className = 'label-disabled';
  }

  this.getAlbumData = () => {
    const album = Array.from(this.el.querySelectorAll('input')).reduce((acc, input) => ({ ...acc, [input.name]: input.value }), {});

    //Handle empty fields
    if (album.title === '') throw 'album title is missing';
    if (album.tags === '') throw 'album tags are missing';

    return album;
  }

  this.render = () => {
    //Create elements
    let titleDiv = document.createElement('div');
    let titleLabel = document.createElement('label');
    let title = document.createElement('input');
    let tagsDiv = document.createElement('div');
    let tagsLabel = document.createElement('label');
    let tags = document.createElement('input');

    //Add classes for styling
    this.el.className = 'upload-album';
    title.className = 'album-input';
    tags.className = 'album-input';

    //Add attributes and innerHTML
    titleLabel.setAttribute('for', 'title');
    titleLabel.innerHTML = 'album title:';
    titleLabel.className = 'label-disabled';
    title.setAttribute('type', 'text');
    title.setAttribute('name', 'title');
    title.disabled = true;

    tagsLabel.setAttribute('for', 'tags');
    tagsLabel.innerHTML = 'album tags:';
    tagsLabel.className = 'label-disabled';
    tags.setAttribute('type', 'text');
    tags.setAttribute('name', 'tags');
    tags.disabled = true;

    //Build structure
    titleDiv.appendChild(titleLabel);
    titleDiv.appendChild(title);
    tagsDiv.appendChild(tagsLabel);
    tagsDiv.appendChild(tags);
    this.el.appendChild(titleDiv);
    this.el.appendChild(tagsDiv);

    //Add listeners

    return this.el;
  }
}

module.exports = UploadAlbum;
