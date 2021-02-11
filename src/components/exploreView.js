//const { createAlbumElement } = require('./utils/components');
const Song = require('./song');
const Album = require('./album');

function ExploreView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    for (let item of this.data) {
      let el;
      if (item.type === 'song') {
        let song = new Song(item);
        el = song.render();
      }
      else if (item.type === 'album') {
        let album = new Album(item);
        el = album.render();
      }
      else {
        continue;
      }
      this.el.appendChild(el);
    }

    app.content.appendChild(this.el);
  }
}

module.exports = ExploreView;
