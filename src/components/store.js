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
    if (this.data[key]) return this.data[key];

    return this.recursiveGetOne(key, this.data);
  }

  this.recursiveGetOne = (key, data) => { //Search for item recursively
    if (data[key]) return data[key];

    for (const _key in data) {
      if (typeof data[_key] === 'object') {
        const res = this.recursiveGetOne(key, data[_key]);
        if (res) return res;
      }
    }
  }

  this.set = (val) => { //Set entire store
    this.data = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }

  this.add = (unique, obj) => { //Add item to store
    this.data[unique] = obj;
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));

    return this.data[unique];
  }

  this.rm = (unique) => { //Remove item from store
    delete this.data[unique];
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }

  this.update = (unique, obj, temporary) => { //Update value of items (temporary flag means the changes won't be written to disk)
    for (let key in obj) this.data[unique][key] = obj[key];
    if (!temporary) fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }
}

// expose the class
module.exports = Store;
