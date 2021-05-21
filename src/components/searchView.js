const Song = require('./song');
const Album = require('./album');
const helpers = require('../utils/helpers');
const io = require('../utils/io');

function SearchView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.searchCategory = 'songs';
  this.searchBy = 'title';
  this.searchQuery = this.data;
  this.results;
  this.children = {
    main: '',
  };

  this.fetch = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await io.search({ searchQuery: this.searchQuery, searchCategory: this.searchCategory, searchBy: this.searchBy });
        console.log(res)
        resolve(res.payload);
      }
      catch (err) {
        reject(err);
      }
    });
  }

  this.refresh = async () => {
    try {
      this.data = null;
      await this.render();
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML

      //Fetch data from server on first render
      if (!this.results) this.results = await this.fetch();

      for (let item of this.results) {
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

      app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = SearchView;
