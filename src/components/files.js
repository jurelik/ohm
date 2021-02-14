const File = require('./file');

function Files(data) {
  this.el = document.createElement('table');
  this.data = data;
  this.state = {};

  this.render = () => {
    let header = document.createElement('tr');
    let playCell = document.createElement('th');
    let nameCell = document.createElement('th');
    let artistCell = document.createElement('th');
    let typeCell = document.createElement('th');
    let tagsCell = document.createElement('th');
    let downloadCell = document.createElement('th');

    this.el.className = 'files';

    playCell.innerHTML = '';
    playCell.setAttribute('id', 'first');
    nameCell.innerHTML = 'name';
    artistCell.innerHTML = 'artist';
    typeCell.innerHTML = 'type';
    tagsCell.innerHTML = 'tags';
    downloadCell.innerHTML = 'download';

    header.appendChild(playCell);
    header.appendChild(nameCell);
    header.appendChild(artistCell);
    header.appendChild(typeCell);
    header.appendChild(tagsCell);
    header.appendChild(downloadCell);

    this.el.appendChild(header);

    //Include song as a file element
    let songFile = new File(app.songView.data);
    this.el.appendChild(songFile.render());

    for (let _file of data) {
      let file = new File(_file);

      //Add file child to app.songView for remote control
      app.songView.children[_file.id] = file;

      this.el.appendChild(file.render());
    }

    return this.el;
  }
}

module.exports = Files;
