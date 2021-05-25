const Album = require('./album');
const Song = require('./song');

function AlbumView(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;

  this.refresh = async () => {
    try {
      await this.render();
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = '' //Reset innerHTML

      //Create elements
      let album = new Album(this.data, 'album');
      let description = document.createElement('div');

      //Add classes for styling
      this.el.className = 'albumView';
      description.className = 'description';

      //Add attributes and innerHTML
      description.innerHTML = data.description;

      //Build structure
      this.el.appendChild(await album.render());
      this.el.appendChild(description);

      for (let _song of this.data.songs) {
        _song.albumTitle = this.data.title; // Include album title in song data
        let song = new Song(_song, 'album');

        this.el.appendChild(await song.render());
      }

      app.content.appendChild(this.el);
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = AlbumView;
