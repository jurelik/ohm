'use strict';

function Nav() {
  this.el = document.querySelector('.nav');
  this.names = ['explore', 'feed', 'pinned', 'following', 'transfers'];
  this.elements = {};
  this.selected = 'explore';

  this.select = (id) => {
    //Check if same item
    if (this.selected === id) return;

    this.elements[id].textContent = `> ${id}`;
    this.elements[id].className = 'selected';
    if (this.selected) this.elements[this.selected].textContent = this.selected;
    if (this.selected) this.elements[this.selected].className = null;
    this.selected = id;
  }

  this.unselect = () => {
    if (!this.selected) return; //Return if no item is selected already

    this.elements[this.selected].textContent = this.selected;
    this.elements[this.selected].className = null;
    this.selected = null;
  }

  this.handleClick = (e) => {
    //Check if same item
    if (e.target.id === app.current) return;

    this.select(e.target.id);
    app.addToHistory(e.target.id);
    app.changeView(e.target.id);
  }

  this.render = () => {
    let first = true;

    for (let name of this.names) {
      //Create nav button
      let el = document.createElement('button');
      el.setAttribute('id', name);
      el.setAttribute('type', 'button');
      el.textContent = first ? `> ${name}` : `  ${name}`;
      first ? el.className = 'selected' : null;
      el.onclick = this.handleClick;
      this.el.appendChild(el);

      //Store reference
      this.elements[name] = el;

      first = false;
    }
    const bw = document.createElement('div');
    const ul = document.createElement('div');
    const dl = document.createElement('div');

    bw.className = 'bw';
    dl.className = 'dl';
    ul.className = 'ul';

    bw.appendChild(dl);
    bw.appendChild(ul);
    this.el.appendChild(bw);
  }
}

module.exports = Nav;
