'use strict'

function Nav() {
  this.nav = document.querySelector('.nav');
  this.names = ['explore', 'feed', 'liked', 'files'];
  this.elements = {};
  this.selected = 'explore';

  this.init = () => {
    let first = true;

    for (let name of this.names) {
      //Create nav button
      let el = document.createElement('button');
      el.setAttribute('id', name);
      el.setAttribute('type', 'button');
      el.innerHTML = first ? `> ${name}` : `  ${name}`;
      first ? el.className = 'selected' : null;
      el.onclick = this.handleClick;
      this.nav.appendChild(el);

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
    this.elements[this.selected].innerHTML = this.selected;
    this.elements[this.selected].className = null;
    this.selected = id;
  }

  this.handleClick = (e) => {
    this.select(e.target.id);
    client.addToHistory(e.target.id);
    client.changeView(e.target.id);
  }
}

module.exports = Nav;
