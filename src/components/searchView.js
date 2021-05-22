const SearchViewMain = require('./searchViewMain');
const io = require('../utils/io');

function SearchView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.searchCategory = this.data.searchCategory;
  this.searchBy = this.data.searchBy;
  this.searchQuery = this.data.searchQuery;
  this.results;
  this.children = {
    main: null,
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

    //Update all search values
    this.searchCategory = this.el.querySelector('#category').value;
    this.searchBy = this.el.querySelector('#by').value;
    this.searchQuery = document.querySelector('.search-input').value;

    //Modify history
    app.history[app.historyIndex].data.searchCategory = this.searchCategory;
    app.history[app.historyIndex].data.searchBy = this.searchBy;
    app.history[app.historyIndex].data.searchQuery = this.searchQuery;

    return this.refresh();
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

    //Select currently selected options in UI
    if (options.name === 'category') select.selectedIndex = options.options.indexOf(this.searchCategory);
    if (options.name === 'by') select.selectedIndex = options.options.indexOf(this.searchBy);

    //Build structure
    el.appendChild(label);
    el.appendChild(select);

    return el;
  }

  this.refresh = async () => {
    try {
      this.results = await this.fetch(); //Re-fetch data
      this.children.main.el.remove(); //Reset main view

      //Include main view
      const main = new SearchViewMain(this.results);
      this.children.main = main;
      this.el.appendChild(await main.render());
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

      document.querySelector('.search-input').value = this.searchQuery; //Update search-input with the current value

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
