'use strict';

const Album = require('../components/album');
const Song = require('../components/song');

function AlbumView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;

  this.init = async () => {
    try {
      const _res = await fetch(`${app.URL}/api/album/${this.data.id}`);
      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      //Re-initialize state
      this.data = res.payload;
      app.albums = []; //Remove old albums from global app.albums
      app.history[app.historyIndex].data.album = res.payload; //Add data to history
    }
    catch (err) {
      throw err;
    }
  }

  this.refresh = async () => {
    try {
      await this.render();
    }
    catch (err) {
      throw err;
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = '' //Reset innerHTML
      if (typeof this.data.songs !== 'object') await this.init();

      //Create elements
      let album = new Album(this.data, 'album');
      let createdAt = document.createElement('div');
      let description = document.createElement('pre');

      //Add classes for styling
      this.el.className = 'album-view';
      createdAt.className = 'created-at';
      description.className = 'description';

      //Add attributes and innerHTML/textContent
      createdAt.textContent = this.data.createdAt;
      description.textContent = this.data.description;

      //Build structure
      this.el.appendChild(await album.render());
      this.el.appendChild(createdAt);
      this.el.appendChild(description);

      for (let _song of this.data.songs) {
        _song.albumTitle = this.data.title; // Include album title in song data
        let song = new Song(_song, 'album');

        this.el.appendChild(await song.render());
      }

      app.content.innerHTML = '';
      app.content.appendChild(this.el);
    }
    catch (err) {
      throw err;
    }
  }
}

module.exports = AlbumView;
