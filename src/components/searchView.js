const SearchViewMain = require('./searchViewMain');
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

  this.handleSearchChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    this.searchCategory = this.el.querySelector('#category').value;
    this.searchBy = this.el.querySelector('#by').value;
    this.searchQuery = this.data;

    console.log(this.searchCategory)
    console.log(this.searchBy)

  }

  this.createSelect = (options) => {
    //Create elements
    let el = document.createElement('div');
    let label = document.createElement('label');
    let select = document.createElement('select');

    //Add classes for styling
    select.className = 'search-select';

    //Add attributes and innerHTML
    label.setAttribute('for', options.name);
    label.innerHTML = options.name + ': ';
    select.setAttribute('type', options.type);
    select.setAttribute('name', options.name);
    select.setAttribute('id', options.name);

    //Add options
    for (let option of options.options) {
      let _el = document.createElement('option');
      _el.setAttribute('value', option);
      _el.innerHTML = option;
      select.appendChild(_el);
    }

    //Build structure
    el.appendChild(label);
    el.appendChild(select);

    return el;
  }

  this.refresh = async () => {
    try {
      this.results = null;
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

      //Create elements
      let category = this.createSelect({
        name: 'category',
        type: 'select',
        options: [ 'songs', 'albums', 'artists', 'files' ]
      });
      let by = this.createSelect({
        name: 'by',
        type: 'select',
        options: [ 'title', 'tags' ]
      });

      //Add classes for styling

      //Add attributes and innerHTML

      //Build structure
      this.el.appendChild(category);
      this.el.appendChild(by);

      //Include main view
      const main = new SearchViewMain(this.results);
      this.children.main = main;
      this.el.appendChild(await main.render());

      //Add listeners
      category.onchange = this.handleSearchChange;
      by.onchange = this.handleSearchChange;

      app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = SearchView;
