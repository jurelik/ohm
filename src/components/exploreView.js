//const { createAlbumElement } = require('./utils/components');
const Song = require('./song');
const Album = require('./album');

function ExploreView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {};
  this.state = {};

  this.render = () => {
    this.children = {};

    for (let item of this.data) {
      let el;
      if (item.type === 'song') {
        let song = new Song(item);
        this.children[item.id] = song;
        el = song.render();
      }
      else if (item.type === 'album') {
        let album = new Album(item);
        this.children[item.id] = album;
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
