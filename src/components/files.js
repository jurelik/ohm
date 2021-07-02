const File = require('./file');

function Files(data) {
  this.el = document.createElement('table');
  this.data = data;
  this.state = {};

  this.render = () => {
    if (this.data.length === 0) { //Handle 0 files scenario
      this.el = document.createElement('div');
      this.el.className = 'files-empty';
      this.el.innerHTML = 'No files found.'
      return this.el;
    }

    let header = document.createElement('tr');
    let playCell = document.createElement('th');
    let idCell = document.createElement('th');
    let nameCell = document.createElement('th');
    let artistCell = document.createElement('th');
    let typeCell = document.createElement('th');
    let fileTypeCell = document.createElement('th');
    let tagsCell = document.createElement('th');
    let infoCell = document.createElement('th');

    this.el.className = 'files';

    playCell.innerHTML = '';
    playCell.setAttribute('id', 'first');
    idCell.innerHTML = 'id';
    nameCell.innerHTML = 'name';
    artistCell.innerHTML = 'artist';
    typeCell.innerHTML = 'type';
    fileTypeCell.innerHTML = 'format';
    tagsCell.innerHTML = 'tags';
    infoCell.innerHTML = 'info';

    header.appendChild(playCell);
    header.appendChild(idCell);
    header.appendChild(nameCell);
    header.appendChild(artistCell);
    header.appendChild(typeCell);
    header.appendChild(fileTypeCell);
    header.appendChild(tagsCell);
    header.appendChild(infoCell);

    this.el.appendChild(header);

    for (let _file of data) {
      let file = new File(_file);

      //Add file child to app.songView for remote control
      app.views.song.children.files[_file.id] = file;

      this.el.appendChild(file.render());
    }

    return this.el;
  }
}

module.exports = Files;
