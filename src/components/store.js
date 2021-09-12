'use strict';

const fs = require('fs');
const path = require('path');

function Store(opts) {
  this.path = null;
  this.data = null;

  this.init = () => {
    this.path = path.join(app.USER_DATA_PATH, `${opts.name}.json`);
    this.data = JSON.parse(fs.readFileSync(this.path));
  }

  this.get = () => { //Get entire store
    return this.data;
  }

  this.getOne = (key) => { //Get one item
    return this.data[key];
  }

  this.set = (val) => { //Set entire store
    this.data = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  this.add = (unique, obj) => { //Add item to store
    this.data[unique] = obj;
    fs.writeFileSync(this.path, JSON.stringify(this.data));

    return this.data[unique];
  }

  this.rm = (unique) => { //Remove item from store
    delete this.data[unique];
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  this.update = (unique, obj, temporary) => { //Update value of items (temporary flag means the changes won't be written to disk)
    for (let key in obj) this.data[unique][key] = obj[key];
    if (!temporary) fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

// expose the class
module.exports = Store;
