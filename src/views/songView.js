'use strict';

const Song = require('../components/song');
const SongViewMain = require('../components/songViewMain');
const Tag = require('../components/tag');

function SongView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;
  this.children = {
    files: {},
    main: null
  };

  this.init = async () => {
    try {
      const _res = await fetch(`${app.URL}/song/${this.data.id}`);

      if (_res.status !== 200) throw new Error('FETCH_ERR');
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      //Re-initialize state
      this.data = res.payload;
      app.songs = []; //Remove old song from global app.songs
      app.history[app.historyIndex].data.song = res.payload; //Add data to history
    }
    catch (err) {
      throw err;
    }
  }

  this.refresh = async () => {
    try {
      const _res = await fetch(`${app.URL}/song/${this.data.id}`);
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      //Re-initialize state
      this.data = res.payload;
      this.children = {
        files: {},
        main: null
      }
      app.songs = []; //Remove old song from global app.songs
      app.history[app.historyIndex].data.song = res.payload; //Add data to history

      await this.render();
    }
    catch (err) {
      throw err;
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = '' //Reset innerHTML
      let action = this.action || 'files';
      if (typeof this.data.files !== 'object' || typeof this.data.comments !== 'object') await this.init();

      //Create elements
      let song = new Song(this.data, 'song');
      this.children.main = new SongViewMain(this.data, action);
      let createdAt = document.createElement('div');
      let tags = document.createElement('div');
      let description = document.createElement('pre');

      //Add classes for styling
      this.el.className = `song-view-${this.action}`;
      createdAt.className = 'created-at';
      tags.className = 'tags';
      description.className = 'description';

      //Add attributes and innerHTML/textContent
      createdAt.textContent = this.data.createdAt;
      description.textContent = this.data.description;

      //Add tags
      for (let tag of this.data.tags) {
        const el = new Tag({ name: tag, type: 'song' });
        tags.appendChild(el.render());
      }

      //Build structure
      this.el.appendChild(await song.render());
      this.el.appendChild(createdAt);
      this.el.appendChild(tags);
      this.el.appendChild(description);
      this.el.appendChild(this.children.main.render());

      app.content.innerHTML = '';
      app.content.appendChild(this.el);
    }
    catch (err) {
      throw err;
    }
  }
}

module.exports = SongView;
