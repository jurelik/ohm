const Song = require('./song');
const Album = require('./album');
const Artist = require('./artist');

function SearchViewMain(data, action) {
  this.el = document.createElement('div');
  this.data = data;
  this.action = action;

  this.reRender = (action) => {
    if (action === this.action) return; //Ignore if we are already on the same view
    this.el.innerHTML = '';
    this.action = action;
    app.history[app.historyIndex].data.action = action; //Modify history
    app.views[app.current].action = action; //Modify action value in view to handle refresh correctly
    this.render();
  }

  this.append = async (data) => {
    try {
      for (let item of data) {
        let el;
        switch (item.type) {
          case 'song':
            let song = new Song(item, 'search');
            el = await song.render();
            break;
          case 'album':
            let album = new Album(item, 'search');
            el = await album.render();
            break;
          case 'artist':
            let artist = new Artist(item, 'search');
            el = artist.render();
            break;
          default:
            continue;
        }

        this.el.insertBefore(el, this.el.querySelector('.load-more'));
      }
    }
    catch (err) {
      throw err;
    }
  }


  this.render = async () => {
    try {
      this.el.className = 'search-view-main';

      for (let item of this.data) {
        let el;

        switch (item.type) {
          case 'song':
            let song = new Song(item, 'search');
            el = await song.render();
            break;
          case 'album':
            let album = new Album(item, 'search');
            el = await album.render();
            break;
          case 'artist':
            let artist = new Artist(item, 'search');
            el = artist.render();
            break;
          default:
            continue;
        }

        this.el.appendChild(el);
      }

      return this.el;
    }
    catch (err) {
      throw err;
    }
  }
}

module.exports = SearchViewMain;
