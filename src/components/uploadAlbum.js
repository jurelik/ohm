'use strict';

function UploadAlbum(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.loadingFromSave = this.data ? true : false; //Are we loading from a save file?

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

    album.tags = album.tags.split(/[,;]+/).filter(tag => tag.length > 0); //Turn tags into an array

    //Handle empty/bad fields
    if (!shallow) {
      if (album.title === '') throw new Error('Album title is missing.');
      if (!helpers.allowedFormat(album.title)) throw new Error('Album title can only include letters, numbers and underscores.'); //Check title for bad characters
      if (album.tags.length === 0) throw new Error('Album tags are missing.');
      for (let tag of album.tags) { //Check tags for bad characters
        if (!helpers.allowedFormat(tag)) throw new Error('Tags can only include letters, numbers and underscores.');
      }
    }

    if (!shallow) album.cid = null; //Add CID property

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
    if (!this.loadingFromSave) titleLabel.className = 'label-disabled'; //Disabled unless album is loaded from save
    titleDiv.className = 'album-title-div';
    tags.className = 'album-input';
    if (!this.loadingFromSave) tagsLabel.className = 'label-disabled'; //Disabled unless album is loaded from save
    tagsDiv.className = 'album-tags-div';
    description.className = 'album-textarea';
    descriptionDiv.className = 'upload-description';
    if (!this.loadingFromSave) descriptionLabel.className = 'label-disabled'; //Disabled unless album is loaded from save

    //Add attributes and innerHTML/textContent
    titleLabel.setAttribute('for', 'title');
    titleLabel.textContent = 'album title:';
    title.setAttribute('type', 'text');
    title.setAttribute('name', 'title');
    if (this.loadingFromSave) title.setAttribute('value', this.data.title); //Set value if loading from save
    if (!this.loadingFromSave) title.disabled = true; //Disabled unless album is loaded from save

    tagsLabel.setAttribute('for', 'tags');
    tagsLabel.textContent = 'album tags:';
    tags.setAttribute('type', 'text');
    tags.setAttribute('name', 'tags');
    if (this.loadingFromSave) tags.setAttribute('value', this.data.tags.join(', ')); //Set value if loading from save
    if (!this.loadingFromSave) tags.disabled = true; //Disabled unless album is loaded from save

    descriptionLabel.setAttribute('for', 'description');
    descriptionLabel.textContent = 'album description:';
    description.setAttribute('name', 'description');
    if (this.loadingFromSave) description.textContent = this.data.description; //Set value if loading from save
    if (!this.loadingFromSave) description.disabled = true; //Disabled unless album is loaded from save

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
