'use strict';

const log = require('../utils/log');

function Tag(data) {
  this.el = document.createElement('button');
  this.data = data;

  this.handleClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    log('hi');
  }

  this.render = () => {
    this.el.innerHTML = ''; //Reset innerHTML

    //Create elements

    //Add classes for styling
    this.el.className = 'tag';

    //Add attributes and innerHTML/textContent
    this.el.textContent = `#${this.data.name}`;

    //Build structure

    //Add listener
    this.el.onclick = this.handleClick;

    return this.el;
  }
}

module.exports = Tag;
