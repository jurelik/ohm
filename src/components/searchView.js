const SearchViewMain = require('./searchViewMain');
const io = require('../utils/io');

function SearchView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.searchCategory = this.data.searchCategory;
  this.searchBy = this.data.searchBy;
  this.searchQuery = this.data.searchQuery;
  this.children = {
    main: null,
  };

  this.fetch = async () => {
    try {
      const res = await io.search({ searchQuery: this.searchQuery, searchCategory: this.searchCategory, searchBy: this.searchBy });
      return res.payload;
    }
    catch (err) {
      throw err;
    }
  }

  this.handleSearchChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    //Update all search values
    this.searchCategory = this.el.querySelector('#category').value;
    this.searchBy = this.el.querySelector('#by').value;
    this.searchQuery = document.querySelector('.search-input').value;

    //Enable/disable tags option depending on whether the category is set to artists
    this.searchCategory === 'artists' ? this.el.querySelector('#by').disabled = true : this.el.querySelector('#by').disabled = false;

    //Modify history
    app.history[app.historyIndex].data.searchCategory = this.searchCategory;
    app.history[app.historyIndex].data.searchBy = this.searchBy;
    app.history[app.historyIndex].data.searchQuery = this.searchQuery;

    if (this.searchQuery.length === 0) return log.error('The search query is empty.');

    return this.refresh();
  }

  this.handleLoadMore = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const _res = await fetch(`${app.URL}/api/search`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery: this.searchQuery,
          searchCategory: this.searchCategory,
          searchBy: this.searchBy,
          loadMore: true,
          lastItem: this.data.results[this.data.results.length - 1]
        })
      });
      const res = await _res.json();

      if (res.type === 'error') throw res.err;

      this.data.results = this.data.results.concat(res.payload); //Append to this.data
      app.history[app.historyIndex].data.results = this.data.results; //Modify history
      await this.children.main.append(res.payload); //Append to DOM
    }
    catch (err) {
      log.error(err);
    }
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
      this.data.results = await this.fetch(); //Re-fetch data
      this.children.main.el.remove(); //Reset main view

      //Include main view
      const main = new SearchViewMain(this.data.results);
      this.children.main = main;
      //this.el.appendChild(await main.render());
      this.el.insertBefore(await main.render(), this.el.querySelector('.load-more'));
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = async () => {
    try {
      this.el.innerHTML = ''; //Reset innerHTML

      if (!this.data.results) this.data.results = await this.fetch(); //Fetch data from server on first render

      //Create elements
      const container = document.createElement('div');
      const category = this.createSelect({
        name: 'category',
        type: 'select',
        options: [ 'songs', 'albums', 'artists', 'files' ]
      });
      const by = this.createSelect({
        name: 'by',
        type: 'select',
        options: [ 'title', 'tags' ]
      });

      //Add classes for styling
      this.el.className = 'search-view';
      container.className = 'search-view-options';

      //Add attributes and innerHTML

      //Build structure
      container.appendChild(category);
      container.appendChild(by);
      this.el.appendChild(container);

      //Include main view
      const main = new SearchViewMain(this.data.results);
      this.children.main = main;
      this.el.appendChild(await main.render());

      //Add load more button
      const loadMore = document.createElement('button');
      loadMore.innerHTML = 'load more..';
      loadMore.className = 'load-more';
      loadMore.onclick = this.handleLoadMore;
      this.el.appendChild(loadMore);

      document.querySelector('.search-input').value = this.searchQuery; //Update search-input with the current value

      //Add listeners
      category.onchange = this.handleSearchChange;
      by.onchange = this.handleSearchChange;

      app.content.innerHTML = '';
      app.content.appendChild(this.el);
    }
    catch (err) {
      console.error(err)
    }
  }
}

module.exports = SearchView;
