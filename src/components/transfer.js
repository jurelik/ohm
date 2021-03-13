const io = require('../utils/io');

function Transfer(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.update = (value) => {
    this.data = app.transfersStore.getOne(this.data.payload.unique); //Update data
    this.el.querySelector(`.${value}`).innerHTML = this.data[value]; //Update DOM
  }

  this.handleResume = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      app.transfersStore.update(this.data.payload.unique, { ...this.data, progress: 0, cycle: 0 });
      this.el.querySelector(`.progress`).innerHTML = 0; //Update DOM
      await io.resumeUpload(this.data);
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = () => {
    //Create elements
    const name = document.createElement('p');
    const artist = document.createElement('p');
    const type = document.createElement('p');
    const progress = document.createElement('p');
    const completed = document.createElement('p');
    const resume = document.createElement('button');

    //Add classes for styling
    this.el.className = 'transfer';
    progress.className = 'progress';

    //Add attributes and innerHTML
    name.innerHTML = this.data.name;
    artist.innerHTML = this.data.artist;
    type.innerHTML = this.data.type;
    progress.innerHTML = this.data.progress;
    resume.innerHTML = 'resume';
    resume.disabled = this.data.completed ? true : false;
    completed.innerHTML = this.data.completed ? 'COMPLETED' : 'INCOMPLETE';

    //Build structure
    this.el.appendChild(name);
    this.el.appendChild(artist);
    this.el.appendChild(type);
    this.el.appendChild(progress);
    this.el.appendChild(completed);
    this.el.appendChild(resume);

    //Add listeners
    resume.onclick = this.handleResume;

    return this.el;
  }
}

module.exports = Transfer;
