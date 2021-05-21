const Song = require('./song');
const Album = require('./album');

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

  this.render = async () => {
    try {
      this.el.className = 'search-view-main';

      for (let item of this.data) {
        let el;
        if (item.type === 'song') {
          let song = new Song(item, 'search');
          el = await song.render();
        }
        else if (item.type === 'album') {
          let album = new Album(item, 'explore');
          el = await album.render();
        }
        else {
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
