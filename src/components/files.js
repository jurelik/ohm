const File = require('./file');

function Files(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    this.el.className = 'files';

    for (let _file of data) {
      let file = new File(_file);
      this.el.appendChild(file.render());
    }

    return this.el;
  }
}

module.exports = Files;