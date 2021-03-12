const fs = require('fs');

function Store(opts) {
  this.path = null;
  this.data = null;

  this.init = () => {
    this.path = `${app.USER_DATA_PATH}/${opts.name}.json`;
    this.data = JSON.parse(fs.readFileSync(this.path));
    console.log(this.data);
  }

  this.get = () => {
    return this.data;
  }

  this.set = (val) => {
    this.data = val;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  this.add = (unique, obj) => {
    this.data[unique] = obj;
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }

  this.update = (unique, obj) => {
    for (let key in obj) {
      this.data[unique][key] = obj[key];
    }
    fs.writeFileSync(this.path, JSON.stringify(this.data));
  }
}

// expose the class
module.exports = Store;
