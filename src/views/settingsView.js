'use strict';

const log = require('../utils/log');

function SettingsView(data) {
  this.el = document.createElement('div');
  this.data = data;
  app.settingsStore.init(); //Update values
  this.settings = app.settingsStore.get();

  this.handleSave = (e) => {
    e.stopPropagation();
    e.preventDefault();

    //Parse all settings
    const query = this.el.querySelectorAll('input[type="text"]')
    for (const setting of query) this.updateSetting(setting.id, setting.value);

    app.settingsStore.set(this.settings);
    log.success('Settings successfully changed.');
  }

  this.updateSetting = (id, value) => {
    for (const section in this.settings) {
      if (this.settings[section][id]) return this.settings[section][id] = value;
    }
  }

  this.createSection = (name) => {
    //Create elements
    const el = document.createElement('div');

    //Add classes for styling
    el.className = 'section';

    //Add attributes and innerHTML/textContent
    el.textContent = name + ': ';

    return el;
  }

  this.createSetting = (name, value) => {
    //Create elements
    const el = document.createElement('div');
    const _name = document.createElement('div');
    const _value = document.createElement('input');

    //Add classes for styling
    el.className = 'setting';

    //Add attributes and innerHTML/textContent
    _name.textContent = name + ': ';
    _value.value = value;
    _value.setAttribute('id', `${name}`);
    _value.setAttribute('type', `text`);

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
    for (const section in this.settings) {
      const el = this.createSection(section);
      this.el.appendChild(el);

      for (const name in this.settings[section]) {
        const el = this.createSetting(name, this.settings[section][name]);
        this.el.appendChild(el);
      }
    }
    this.el.appendChild(save);

    //Add listeners
    save.addEventListener('click', this.handleSave);

    app.content.innerHTML = '';
    app.content.appendChild(this.el);
  }
}

module.exports = SettingsView;
