'use strict';

const log = require('../utils/log');

function SettingsView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.settings = app.settingsStore.get();

  this.handleSave = (e) => {
    e.stopPropagation();
    e.preventDefault();

    let settings = {};
    const query = this.el.querySelectorAll('div[contenteditable="true"]')
    for (const setting of query) settings[setting.id] = setting.textContent;

    app.settingsStore.set(settings);
    log.success('Settings successfully changed.');
  }

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
    _value.setAttribute('id', `${name}`);
    _value.setAttribute('contenteditable', 'true');

    //Build structure
    el.appendChild(_name);
    el.appendChild(_value);

    return el;
  }

  this.render = () => {
    //Create elements
    const save = document.createElement('input');

    //Add classes for styling
    this.el.className = 'settings-view'
    save.className = 'save';

    //Add attributes and innerHTML/textContent
    save.setAttribute('type', 'submit');
    save.setAttribute('value', 'save');

    //Build structure
    for (const name in this.settings) {
      const el = this.createSetting(name, this.settings[name]);
      this.el.appendChild(el);
    }
    this.el.appendChild(save);

    //Add listeners
    save.addEventListener('click', this.handleSave);

    app.content.innerHTML = '';
    app.content.appendChild(this.el);
  }
}

module.exports = SettingsView;
