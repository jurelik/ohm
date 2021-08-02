'use strict';

const log = require('../utils/log');

function SettingsView(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.render = () => {
    //Create elements
    const test = document.createElement('div');

    //Add classes for styling
    test.className = 'test';

    //Add attributes and innerHTML/textContent
    test.textContent = 'hello'

    //Build structure
    this.el.appendChild(test);

    //Add listeners

    app.content.innerHTML = '';
    app.content.appendChild(this.el);
  }
}

module.exports = SettingsView;
