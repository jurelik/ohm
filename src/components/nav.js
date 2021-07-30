'use strict'

function Nav() {
  this.el = document.querySelector('.nav');
  this.names = ['explore', 'feed', 'pinned', 'following', 'transfers'];
  this.elements = {};
  this.selected = 'explore';

  this.render = () => {
    let first = true;

    for (let name of this.names) {
      //Create nav button
      let el = document.createElement('button');
      el.setAttribute('id', name);
      el.setAttribute('type', 'button');
      el.innerHTML = first ? `> ${name}` : `  ${name}`;
      first ? el.className = 'selected' : null;
      el.onclick = this.handleClick;
      this.el.appendChild(el);

      //Store reference
      this.elements[name] = el;

      first = false;
    }
  }

  this.select = (id) => {
    //Check if same item
    if (this.selected === id) return;

    this.elements[id].innerHTML = `> ${id}`;
    this.elements[id].className = 'selected';
    if (this.selected) this.elements[this.selected].innerHTML = this.selected;
    if (this.selected) this.elements[this.selected].className = null;
    this.selected = id;
  }

  this.unselect = () => {
    if (!this.selected) return; //Return if no item is selected already

    this.elements[this.selected].innerHTML = this.selected;
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
}

module.exports = Nav;
