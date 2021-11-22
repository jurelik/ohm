'use strict';

const { shell } = require('electron');
const helpers = require('../utils/helpers');
const { infoIcon } = require('../utils/svgs');

function UploadFile(data) {
  this.el = document.createElement('fieldset');
  this.data = data;
  this.loadingFromSave = this.data.file ? true : false; //Are we loading from a save file?

  //Elements
  this.name = null;
  this.id = null;
  this.tags = null;
  this.info = null;
  this.file = null;

  //Add unique id to file and increase fileCounter
  this.unique = app.views.upload.fileCounter;
  app.views.upload.fileCounter++;

  this.handleTypeChange = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.target.value === 'original' || e.target.value === 'external') this.setOriginalExternal();
    else this.setInternal();
  }

  this.handleLicenseChange = (e) => {
    e.stopPropagation();
    e.preventDefault();

    //Mutually exclusive checkboxes
    if (e.target.value === 'SA' && this.el.querySelector(`#SA-${this.unique}`).checked) this.el.querySelector(`#ND-${this.unique}`).checked = false;
    else if (e.target.value === 'ND' && this.el.querySelector(`#ND-${this.unique}`).checked) this.el.querySelector(`#SA-${this.unique}`).checked = false;
    else if (e.target.value === 'BY' && this.el.querySelector(`#BY-${this.unique}`).checked) {
      this.el.querySelector(`#SA-${this.unique}`).disabled = false;
      this.el.querySelector(`#NC-${this.unique}`).disabled = false;
      this.el.querySelector(`#ND-${this.unique}`).disabled = false;
    }
    else if (e.target.value === 'BY' && !this.el.querySelector(`#BY-${this.unique}`).checked) {
      this.el.querySelector(`#SA-${this.unique}`).disabled = true;
      this.el.querySelector(`#NC-${this.unique}`).disabled = true;
      this.el.querySelector(`#ND-${this.unique}`).disabled = true;
    };
  }

  this.handleDeleteFile = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.data.handleRemoveFile(this.unique);
  }

  this.handleLicenseInfo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    shell.openExternal('https://creativecommons.org/about/cclicenses/');
  }

  this.handleDragEnter = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!this.el.querySelector('input[type=radio][value="internal"]').checked) this.el.querySelector('.file-overlay').style.visibility = "visible";
  }

  this.handleDragLeave = (e) => {
    this.el.querySelector('.file-overlay').style.visibility = "hidden";
  }

  this.handleFileDrop = (e) => {
    e.stopPropagation();
    e.preventDefault();

    this.el.querySelector('.file-overlay').style.visibility = "hidden";

    this.file.querySelector('input').files = e.dataTransfer.files;
    if (this.name.querySelector('input').value === '') this.name.querySelector('input').value = e.dataTransfer.files[0].name.slice(0, -4);
  }

  this.getFileData = (shallow) => {
    const file = helpers.parseInputs('file', this.el);

    //Handle empty/bad fields
    if ((file.type === 'original' || file.type === 'external') && !shallow) {
      if (file.name === '') throw new Error('File name is missing.');
      if (!helpers.allowedFormat(file.name)) throw new Error('File name can only include letters, numbers and underscores.'); //Check name for bad characters
      if (!file.path || file.path === '') throw new Error('File is missing.');
      if (file.tags.length === 0) throw new Error('File tags are missing.');
      for (let tag of file.tags) { //Check tags for bad characters
        if (!helpers.allowedFormat(tag)) throw new Error('Tags can only include letters, numbers and underscores.');
      }
    }
    else if (file.type === 'internal' && file.id === '' && !shallow) throw new Error('File id is missing');

    //Add properties
    if (!shallow) {
      file.cid = null;
      if (file.type !== 'internal') file.format = file.path.slice(-3);
    }
    else delete file.path; //Delete path if we are just saving state

    return file;
  }

  this.setInternal = () => {
    this.id.querySelector('input').disabled = false;
    this.id.querySelector('label').className = '';

    this.name.querySelector('input').disabled = true;
    this.name.querySelector('label').className = 'label-disabled';
    this.tags.querySelector('input').disabled = true;
    this.tags.querySelector('label').className = 'label-disabled';
    this.info.querySelector('input').disabled = true;
    this.info.querySelector('label').className = 'label-disabled';
    this.file.querySelector('input').disabled = true;
    this.file.querySelector('label').className = 'label-disabled';

    this.el.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
      checkbox.disabled = true;
    });
    this.el.querySelectorAll('.checkbox-group-div p').forEach(p => {
      p.className = 'label-disabled';
    });
    this.el.querySelectorAll('.checkbox-group-div label').forEach(label => {
      label.className = 'label-disabled';
    });
  }

  this.setOriginalExternal = () => {
    this.id.querySelector('input').disabled = true;
    this.id.querySelector('label').className = 'label-disabled';

    this.name.querySelector('input').disabled = false;
    this.name.querySelector('label').className = '';
    this.tags.querySelector('input').disabled = false;
    this.tags.querySelector('label').className = '';
    this.info.querySelector('input').disabled = false;
    this.info.querySelector('label').className = '';
    this.file.querySelector('input').disabled = false;
    this.file.querySelector('label').className = '';

    this.el.querySelectorAll('input[type=checkbox]').forEach(checkbox => {
      if (checkbox.id === `BY-${this.unique}`) checkbox.disabled = false;
      else if (this.el.querySelector(`#BY-${this.unique}`).checked) checkbox.disabled = false;
    });
    this.el.querySelectorAll('.checkbox-group-div p').forEach(p => {
      p.className = '';
    });
    this.el.querySelectorAll('.checkbox-group-div label').forEach(label => {
      label.className = '';
    });
  }

  this.createInput = (name, type) => {
    //Create elements
    let el = document.createElement('div');
    let label = document.createElement('label');
    let input = document.createElement('input');

    //Add classes for styling
    el.className = `file-${name}-div`
    input.className = `file-input`;

    //Add attributes and innerHTML/textContent
    label.setAttribute('for', name);
    label.textContent = name + ':';
    input.setAttribute('type', type);
    input.setAttribute('name', name);
    if (this.loadingFromSave) input.setAttribute('value', this.data.file[name]); //Set value if loading from save

    //Build structure
    el.appendChild(label);
    el.appendChild(input);

    return el;
  }

  this.createRadio = (name) => {
    //Create elements
    let el = document.createElement('div')
    let label = document.createElement('label');
    let input = document.createElement('input');

    //Add classes for styling
    el.className = 'radio-div';
    input.className = 'file-input';

    //Add attributes and innerHTML/textContent
    label.setAttribute('for', `${name}-${this.unique}`);
    label.textContent = name;
    input.setAttribute('type', 'radio');
    input.setAttribute('id', `${name}-${this.unique}`);
    input.setAttribute('name', 'type-' + this.unique);
    input.setAttribute('value', name);
    if (this.loadingFromSave && this.data.file.type === name) input.checked = true; //Set checked state if loading from save

    //Add listeners
    input.onchange = this.handleTypeChange;

    //Build structure
    el.appendChild(input);
    el.appendChild(label);

    return el;
  }

  this.createCheckbox = (name) => {
    //Create elements
    let el = document.createElement('div')
    let label = document.createElement('label');
    let input = document.createElement('input');

    //Add classes for styling
    el.className = 'checkbox-div';
    input.className = 'file-input';

    //Add attributes and innerHTML/textContent
    label.setAttribute('for', `${name}-${this.unique}`);
    label.textContent = name;
    input.setAttribute('type', 'checkbox');
    input.setAttribute('id', `${name}-${this.unique}`);
    input.setAttribute('name', 'license-' + this.unique);
    input.setAttribute('value', name);

    const license = this.loadingFromSave ? this.data.file.license : null;
    if (license && license.includes(name)) input.checked = true; //Set checked if loading from save
    if ((name !== 'BY' && !license) || (name !== 'BY' && license.length < 1)) input.disabled = true; //Disable all checkboxes except BY on first render, except if we are loading from save

    //Add listeners
    input.onchange = this.handleLicenseChange;

    //Build structure
    el.appendChild(input);
    el.appendChild(label);

    return el;
  }

  this.render = () => {
    //Create elements
    let legend = document.createElement('legend');
    let typeDiv = document.createElement('div');
    let typeLabel = document.createElement('p');
    let typeOriginal = this.createRadio('original');
    let typeInternal = this.createRadio('internal');
    let typeExternal = this.createRadio('external');
    let name = this.createInput('name', 'text');
    let id = this.createInput('id', 'text');
    let tags = this.createInput('tags', 'text');
    let info = this.createInput('info', 'text');
    let licenseDiv = document.createElement('div');
    let licenseLabel = document.createElement('p');
    let licenseCC = document.createElement('p');
    let licenseBY = this.createCheckbox('BY');
    let licenseNC = this.createCheckbox('NC');
    let licenseSA = this.createCheckbox('SA');
    let licenseND = this.createCheckbox('ND');
    let licenseInfoButton = document.createElement('button');
    let file = this.createInput('file', 'file');
    let deleteFile = document.createElement('button');

    //Add classes for styling
    this.el.className = 'upload-file';
    typeDiv.className = 'radio-group-div';
    licenseDiv.className = 'checkbox-group-div';
    id.querySelector('label').className = 'label-disabled';
    licenseInfoButton.className = 'license-info-button'

    //Add attributes and innerHTML/textContent
    legend.textContent = 'file:'
    typeLabel.textContent = 'type:';
    if (!this.loadingFromSave) typeOriginal.querySelector('.file-input').checked = true;
    licenseLabel.textContent = 'license:';
    licenseCC.textContent = 'CC';
    id.querySelector('.file-input').disabled = true;
    deleteFile.textContent = 'delete file';
    licenseInfoButton.innerHTML = infoIcon;
    licenseInfoButton.setAttribute('title', 'how do licenses work?');

    //Build structure
    typeDiv.appendChild(typeLabel);
    typeDiv.appendChild(typeOriginal);
    typeDiv.appendChild(typeInternal);
    typeDiv.appendChild(typeExternal);
    licenseDiv.appendChild(licenseLabel);
    licenseDiv.appendChild(licenseCC);
    licenseDiv.appendChild(licenseBY);
    licenseDiv.appendChild(licenseNC);
    licenseDiv.appendChild(licenseSA);
    licenseDiv.appendChild(licenseND);
    licenseDiv.appendChild(licenseInfoButton);
    this.el.appendChild(legend);
    this.el.appendChild(typeDiv);
    this.el.appendChild(name);
    this.el.appendChild(id);
    this.el.appendChild(tags);
    this.el.appendChild(info);
    this.el.appendChild(licenseDiv);
    this.el.appendChild(file);
    this.el.appendChild(deleteFile);

    //Add drag & drop overlay
    const overlay = document.createElement('div');
    overlay.className = 'file-overlay';
    this.el.appendChild(overlay);

    //Save references elements
    this.name = name;
    this.id = id;
    this.tags = tags;
    this.info = info;
    this.file = file;

    if (this.loadingFromSave && this.data.file.type === 'internal') this.setInternal(); //Disable inputs if loading from save and type is internal

    //Add listeners
    deleteFile.onclick = this.handleDeleteFile;
    licenseInfoButton.onclick = this.handleLicenseInfo;
    this.el.ondragenter = this.handleDragEnter;
    overlay.ondragenter = (e) => e.preventDefault();
    overlay.ondragover = (e) => e.preventDefault();
    overlay.ondragleave = this.handleDragLeave;
    overlay.ondrop = this.handleFileDrop;

    return this.el;
  }
}

module.exports = UploadFile;
