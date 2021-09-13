'use strict';

const ipfs = require('../utils/ipfs');
const log = require('../utils/log');
const { pauseIcon, refreshIconSmall, deleteIcon } = require('../utils/svgs');

function Transfer(data, unique) {
  this.el = document.createElement('tr');
  this.data = data;
  this.unique = unique; //Store transfer's unique key

  this.update = (value) => {
    this.data = app.transfersStore.getOne(this.unique); //Update data
    if (value === 'progress') this.el.querySelector(`.${value}`).textContent = this.data[value] + '%'; //Update DOM
    else this.el.querySelector(`.${value}`).textContent = this.data[value]; //Update DOM
  }

  this.handleComplete = () => {
    this.data.completed = true;
    this.el.querySelector('.completed').textContent = 'COMPLETED';
    this.el.querySelector('button').remove();
  }

  this.handleResume = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      if (this.data.active) { //If active pause
        this.el.querySelector(`.resume`).innerHTML = refreshIconSmall; //Update DOM
        ipfs.pauseTransfer(this.unique);
        log.success('Transfer paused.');
        return;
      }

      log('Innitiating transfer..');
      this.el.querySelector(`.resume`).innerHTML = pauseIcon; //Update DOM
      await ipfs.resumeTransfer(this.unique);
    }
    catch (err) {
      log.error(err.message);
    }
  }

  this.handleClear = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      await ipfs.clearTransfer(this.unique);
    }
    catch (err) {
      log.error(err.message);
    }
  }

  this.reRender = () => {
    this.data = app.transfersStore.getOne(this.unique); //Update data
    this.el.innerHTML = '';
    this.render();
  }

  this.render = () => {
    //Create elements
    const artist = document.createElement('td');
    const title = document.createElement('td');
    const type = document.createElement('td');
    const progress = document.createElement('td');
    const completed = document.createElement('td');
    const actionsCell = document.createElement('td');
    const resume = document.createElement('button');
    const clear = document.createElement('button');

    //Add classes for styling
    this.el.className = 'transfer';
    progress.className = 'progress';
    actionsCell.className = 'actions-cell';
    completed.className = 'completed';
    resume.className = 'resume';
    clear.className = 'clear';

    //Add attributes and innerHTML/textContent
    artist.textContent = this.data.artist;
    title.textContent = this.data.title;
    type.textContent = this.data.type;
    progress.textContent = this.data.progress + '%';
    resume.innerHTML = this.data.active ? pauseIcon : refreshIconSmall;
    resume.disabled = this.data.completed ? true : false;
    clear.innerHTML = deleteIcon;
    completed.textContent = this.data.completed ? 'COMPLETED' : 'INCOMPLETE';

    //Build structure
    this.el.appendChild(artist);
    this.el.appendChild(title);
    this.el.appendChild(type);
    this.el.appendChild(progress);
    this.el.appendChild(completed);
    actionsCell.appendChild(resume);
    actionsCell.appendChild(clear);
    this.el.appendChild(actionsCell);

    //Add listeners
    resume.onclick = this.handleResume;
    clear.onclick = this.handleClear;

    return this.el;
  }
}

module.exports = Transfer;
