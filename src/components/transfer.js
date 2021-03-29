const io = require('../utils/io');
const ipfs = require('../utils/ipfs');
const log = require('../utils/log');

function Transfer(data, unique) {
  this.el = document.createElement('div');
  this.data = data;
  this.unique = unique; //Store transfer's unique key

  this.update = (value) => {
    this.data = app.transfersStore.getOne(this.unique); //Update data
    this.el.querySelector(`.${value}`).innerHTML = this.data[value]; //Update DOM
  }

  this.handleComplete = () => {
    this.data.completed = true;
    this.el.querySelector('.completed').innerHTML = 'COMPLETED';
    this.el.querySelector('button').remove();
  }

  this.handleResume = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      if (this.data.active) { //If active pause
        log('Innitiating pause..');
        this.el.querySelector(`.resume`).innerHTML = 'resume'; //Update DOM
        ipfs.pausePin(this.unique);
        log.success('Successfully paused.');
        return;
      }

      switch (this.data.type) {
        case 'pin':
          log('Innitiating transfer..');
          this.el.querySelector(`.resume`).innerHTML = 'pause'; //Update DOM
          await ipfs.resumePin(this.unique);
          log.success('Successfully pinned.');
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  this.handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();

    app.transfersStore.rm(this.unique);
    return app.views.transfersView.removeTransfer(this.unique);
  }

  this.reRender = () => {
    this.data = app.transfersStore.getOne(this.unique); //Update data
    this.el.innerHTML = '';
    this.render();
  }

  this.render = () => {
    //Create elements
    const name = document.createElement('p');
    const artist = document.createElement('p');
    const type = document.createElement('p');
    const progress = document.createElement('p');
    const completed = document.createElement('p');
    const resume = document.createElement('button');
    const clear = document.createElement('button');

    //Add classes for styling
    this.el.className = 'transfer';
    progress.className = 'progress';
    completed.className = 'completed';
    resume.className = 'resume';

    //Add attributes and innerHTML
    name.innerHTML = this.data.name;
    artist.innerHTML = this.data.artist;
    type.innerHTML = this.data.type;
    progress.innerHTML = this.data.progress;
    resume.innerHTML = this.data.active ? 'pause' : 'resume';
    resume.disabled = this.data.completed ? true : false;
    clear.innerHTML = 'clear';
    completed.innerHTML = this.data.completed ? 'COMPLETED' : 'INCOMPLETE';

    //Build structure
    this.el.appendChild(name);
    this.el.appendChild(artist);
    this.el.appendChild(type);
    this.el.appendChild(progress);
    this.el.appendChild(completed);
    if (!this.data.completed) this.el.appendChild(resume);
    this.el.appendChild(clear);

    //Add listeners
    resume.onclick = this.handleResume;
    clear.onclick = this.handleClear;

    return this.el;
  }
}

module.exports = Transfer;
