const io = require('../utils/io');
const ipfs = require('../utils/ipfs');

function Transfer(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.update = (value) => {
    this.data = app.transfersStore.getOne(this.data.payload.unique); //Update data
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

      }

      switch (this.data.type) {
        case 'upload':
          app.transfersStore.update(this.data.payload.unique, { ...this.data, progress: 0, cycle: 0, active: true });
          this.el.querySelector(`.progress`).innerHTML = 0; //Update DOM
          this.el.querySelector(`.resume`).innerHTML = 'pause'; //Update DOM
          await io.resumeUpload(this.data);
        case 'pin':
          app.transfersStore.update(this.data.payload.unique, { ...this.data, active: true });
          this.el.querySelector(`.resume`).innerHTML = 'pause'; //Update DOM
          await ipfs.pinSong(this.data.payload);
      }
    }
    catch (err) {
      console.error(err);
    }
  }

  this.handleClear = (e) => {
    e.stopPropagation();
    e.preventDefault();

    app.transfersStore.rm(this.data.payload.unique);
    return app.views.transfersView.removeTransfer(this.data.payload.unique);
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
