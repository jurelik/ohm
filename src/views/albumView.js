const Album = require('../components/album');
const Song = require('../components/song');

function AlbumView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;

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

      //Create elements
      let album = new Album(this.data, 'album');
      let createdAt = document.createElement('div');
      let description = document.createElement('pre');

      //Add classes for styling
      this.el.className = 'album-view';
      createdAt.className = 'created-at';
      description.className = 'description';

      //Add attributes and innerHTML
      createdAt.innerHTML = this.data.createdAt;
      description.innerHTML = this.data.description;

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
