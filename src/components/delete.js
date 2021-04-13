const log = require('../utils/log');
const ipfs = require('../utils/ipfs');
const io = require('../utils/io');

function Delete(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.handleNo = (e) => {
    e.preventDefault();
    e.stopPropagation();

    app.header.handleBack();
  }

  this.handleYes = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      log('Initiating delete..')
      await io.deleteSong(this.data);
      log.success('Song successfully deleted.');
    }
    catch (err) {
      log.error(err);
    }
  }

  this.render = () => {
    //Create elements
    const message = document.createElement('p');
    const options = document.createElement('div');
    const yes = document.createElement('button');
    const no = document.createElement('button');

    //Add classes for styling
    this.el.className = 'delete';

    //Add attributes and innerHTML
    message.innerHTML = 'are you sure you want to delete this song?'
    yes.innerHTML = 'yes';
    no.innerHTML = 'no';

    //Build structure
    this.el.appendChild(message);
    this.el.appendChild(options);
    options.appendChild(yes);
    options.appendChild(no);

    //Add listeners
    no.onclick = this.handleNo;
    yes.onclick = this.handleYes;

    return this.el;
  }
}

module.exports = Delete;
