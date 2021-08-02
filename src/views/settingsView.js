'use strict';

const log = require('../utils/log');

function SettingsView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.settings = app.settingsStore.get();

  this.createSetting = (name, value) => {
    //Create elements
    const el = document.createElement('div');
    const _name = document.createElement('div');
    const _value = document.createElement('div');

    //Add classes for styling
    el.className = 'setting';

    //Add attributes and innerHTML/textContent
    _name.textContent = name + ': ';
    _value.textContent = value;
    _value.setAttribute('contenteditable', 'true');

    //Build structure
    el.appendChild(_name);
    el.appendChild(_value);

    return el;
  }

  this.render = () => {
    //Create elements

    //Add classes for styling
    this.el.className = 'settings-view'

    //Add attributes and innerHTML/textContent

    //Build structure
    for (const name in this.settings) {
      const el = this.createSetting(name, this.settings[name]);
      this.el.appendChild(el);
    }

    //Add listeners

    app.content.innerHTML = '';
    app.content.appendChild(this.el);
  }
}

module.exports = SettingsView;
