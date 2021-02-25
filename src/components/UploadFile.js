function UploadFile(data) {
  this.el = document.createElement('fieldset');
  this.data = data;
  this.name = null;
  this.id = null;
  //Add unique id to file and increase fileCounter
  this.unique = app.views.uploadView.fileCounter;
  app.views.uploadView.fileCounter++;

  this.handleTypeChange = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (e.target.value === 'original' || e.target.value === 'external') {
      this.id.querySelector('input').disabled = true;
      this.id.querySelector('label').className = 'label-disabled';

      this.name.querySelector('input').disabled = false;
      this.name.querySelector('label').className = '';
    }
    else if (e.target.value === 'internal') {
      this.id.querySelector('input').disabled = false;
      this.id.querySelector('label').className = '';

      this.name.querySelector('input').disabled = true;
      this.name.querySelector('label').className = 'label-disabled';
    }
  }

  this.getFileData = () => {
    const file = Array.from(this.el.querySelectorAll('.file-input')).reduce((acc, input) => {
      if (input.type === 'radio' && input.checked) return { ...acc, type: input.value };
      else if (input.type === 'radio' && !input.checked) return { ...acc };
      else if (input.type === 'file') return { ...acc, [input.name]: input.files[0] };

      return { ...acc, [input.name]: input.value };
    }, {});

    //Handle empty fields
    if (file.type === 'original' || file.type === 'external') {
      if (file.name === '') throw 'file name is missing';
      if (file.file === '') throw 'file is missing';
    }
    else if (file.type === 'internal') {
      if (file.id === '') throw 'file name is missing';
      if (file.file === '') throw 'file is missing';
    }

    return file;
  }

  this.createInput = (name, type) => {
    //Create elements
    let el = document.createElement('div');
    let label = document.createElement('label');
    let input = document.createElement('input');

    //Add classes for styling
    input.className = 'file-input';

    //Add attributes and innerHTML
    label.setAttribute('for', name);
    label.innerHTML = name + ': ';
    input.setAttribute('type', type);
    input.setAttribute('name', name);

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
    el.className = name;
    input.className = 'file-input';

    //Add attributes and innerHTML
    label.setAttribute('for', name);
    label.innerHTML = name;
    input.setAttribute('type', 'radio');
    input.setAttribute('name', 'type-' + this.unique);
    input.setAttribute('value', name);

    //Add listeners
    input.onchange = this.handleTypeChange;

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
    let file = this.createInput('file', 'file');

    //Add classes for styling
    this.el.className = 'upload-file';
    typeDiv.className = 'radio-group-div';
    id.querySelector('label').className = 'label-disabled';

    //Add attributes and innerHTML
    legend.innerHTML = 'file: '
    typeLabel.innerHTML = 'type: ';
    typeOriginal.querySelector('.file-input').checked = true;
    id.querySelector('.file-input').disabled = true;

    //Build structure
    typeDiv.appendChild(typeLabel);
    typeDiv.appendChild(typeOriginal);
    typeDiv.appendChild(typeInternal);
    typeDiv.appendChild(typeExternal);
    this.el.appendChild(legend);
    this.el.appendChild(typeDiv);
    this.el.appendChild(name);
    this.el.appendChild(id);
    this.el.appendChild(tags);
    this.el.appendChild(info);
    this.el.appendChild(file);

    //Save reference to name and id elements
    this.name = name;
    this.id = id;

    //Add listeners

    return this.el;
  }
}

module.exports = UploadFile;
