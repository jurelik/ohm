'use strict';

function Tag(data) {
  this.el = document.createElement('button');
  this.data = data;

  this.handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (app.current === 'search') return app.views.search.handleSearchChange(e);

    app.addToHistory('search', { searchQuery: this.data.name, searchCategory: `${this.data.type}s`, searchBy: 'tags' });
    app.changeView('search', { searchQuery: this.data.name, searchCategory: `${this.data.type}s`, searchBy: 'tags' });
  }

  this.render = () => {
    this.el.innerHTML = ''; //Reset innerHTML

    //Add classes for styling
    this.el.className = 'tag';

    //Add attributes and innerHTML/textContent
    this.el.textContent = `#${this.data.name}`;

    //Add listener
    this.el.onclick = this.handleClick;

    return this.el;
  }
}

module.exports = Tag;
