function UploadFile(data) {
  this.el = document.createElement('fieldset');
  this.data = data;

  this.handleTypeChange = (e) => {
    e.stopPropagation();
    e.preventDefault();

  }

  this.getFileData = () => {
    const file = Array.from(this.el.querySelectorAll('.file-input')).reduce((acc, input) => {
      if (input.type === 'radio' && input.checked) return { ...acc, [input.name]: input.id };
      else if (input.type === 'radio' && !input.checked) return { ...acc };

      return { ...acc, [input.name]: input.value };
    }, {});
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
    el.className = 'radio-div';
    input.className = 'file-input';

    //Add attributes and innerHTML
    label.setAttribute('for', name);
    label.innerHTML = name;
    input.setAttribute('type', 'radio');
    input.setAttribute('name', 'type');
    input.setAttribute('id', name);

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
    let tags = this.createInput('tags', 'text');
    let info = this.createInput('info', 'text');
    let file = this.createInput('file', 'file');

    //Add classes for styling
    this.el.className = 'upload-file';
    typeDiv.className = 'radio-group-div';

    //Add attributes and innerHTML
    legend.innerHTML = 'file: '
    typeLabel.innerHTML = 'type: ';

    //Build structure
    typeDiv.appendChild(typeLabel);
    typeDiv.appendChild(typeOriginal);
    typeDiv.appendChild(typeInternal);
    typeDiv.appendChild(typeExternal);
    this.el.appendChild(legend);
    this.el.appendChild(typeDiv);
    this.el.appendChild(name);
    this.el.appendChild(tags);
    this.el.appendChild(info);
    this.el.appendChild(file);

    //Add listeners

    return app.content.appendChild(this.el);
  }
}

module.exports = UploadFile;
