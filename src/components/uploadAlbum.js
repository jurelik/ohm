'use strict';

function UploadAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.enable = () => {
    let inputs = this.el.querySelectorAll('input');
    let labels = this.el.querySelectorAll('label');
    let textarea = this.el.querySelector('textarea');

    for (let input of inputs) input.disabled = false;
    for (let label of labels) label.className = '';
    textarea.disabled = false;
  }

  this.disable = () => {
    let inputs = this.el.querySelectorAll('input');
    let labels = this.el.querySelectorAll('label');
    let textarea = this.el.querySelector('textarea');

    for (let input of inputs) input.disabled = true;
    for (let label of labels) label.className = 'label-disabled';
    textarea.disabled = true;
  }

  this.getAlbumData = (shallow) => {
    const album = Array.from(this.el.querySelectorAll('input')).reduce((acc, input) => ({ ...acc, [input.name]: input.value }), {});
    album.description = this.el.querySelector('textarea').value;

    //Handle empty fields
    if (album.title === '') throw new Error('Album title is missing.');
    if (album.tags === '') throw new Error('Album tags are missing.');

    album.tags = album.tags.split(/[,;]+/).filter(tag => tag.length > 0); //Turn tags into an array
    if (album.tags.length === 0) throw new Error('Album tags are missing');

    //Check formatting
    if (!helpers.allowedFormat(album.title)) throw new Error('Album title can only include letters, numbers and underscores.');
    for (let tag of album.tags) {
      if (!helpers.allowedFormat(tag)) throw new Error('Tags can only include letters, numbers and underscores.');
    }

    //Add CID property
    if (!shallow) album.cid = null;

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
    let descriptionDiv = document.createElement('div');
    let descriptionLabel = document.createElement('label');
    let description = document.createElement('textarea');

    //Add classes for styling
    this.el.className = 'upload-album';
    title.className = 'album-input';
    titleLabel.className = 'label-disabled';
    titleDiv.className = 'album-title-div';
    tags.className = 'album-input';
    tagsLabel.className = 'label-disabled';
    tagsDiv.className = 'album-tags-div';
    description.className = 'album-textarea';
    descriptionDiv.className = 'upload-description';
    descriptionLabel.className = 'label-disabled';

    //Add attributes and innerHTML/textContent
    titleLabel.setAttribute('for', 'title');
    titleLabel.textContent = 'album title:';
    title.setAttribute('type', 'text');
    title.setAttribute('name', 'title');
    title.disabled = true;

    tagsLabel.setAttribute('for', 'tags');
    tagsLabel.textContent = 'album tags:';
    tags.setAttribute('type', 'text');
    tags.setAttribute('name', 'tags');
    tags.disabled = true;

    descriptionLabel.setAttribute('for', 'description');
    descriptionLabel.textContent = 'album description:';
    description.setAttribute('name', 'description');
    description.disabled = true;

    //Build structure
    titleDiv.appendChild(titleLabel);
    titleDiv.appendChild(title);
    tagsDiv.appendChild(tagsLabel);
    tagsDiv.appendChild(tags);
    descriptionDiv.appendChild(descriptionLabel);
    descriptionDiv.appendChild(description);
    this.el.appendChild(titleDiv);
    this.el.appendChild(tagsDiv);
    this.el.appendChild(descriptionDiv);

    return this.el;
  }
}

module.exports = UploadAlbum;
