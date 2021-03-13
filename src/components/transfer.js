function Transfer(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.update = (value) => {
    console.log(value);
    this.data = app.transfersStore.getOne(this.data.payload.unique); //Update data
    this.el.querySelector(`.${value}`).innerHTML = this.data[value]; //Update DOM
  }

  this.render = () => {
      //Create elements
      const name = document.createElement('p');
      const artist = document.createElement('p');
      const type = document.createElement('p');
      const progress = document.createElement('p');

      //Add classes for styling
      this.el.className = 'transfer';
      progress.className = 'progress';

      //Add attributes and innerHTML
      name.innerHTML = this.data.name;
      artist.innerHTML = this.data.artist;
      type.innerHTML = this.data.type;
      progress.innerHTML = this.data.progress;

      //Build structure
      this.el.appendChild(name);
      this.el.appendChild(artist);
      this.el.appendChild(type);
      this.el.appendChild(progress);

      return this.el;
  }
}

module.exports = Transfer;
