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
      el.onclick = this.handleClick;
      this.nav.appendChild(el);

      //Store reference
      this.elements[name] = el;

      first = false;
    }
  }

  this.handleClick = (e) => {
    this.elements[e.srcElement.id].innerHTML = `> ${e.srcElement.id}`;
    this.elements[this.selected].innerHTML = this.selected;
    this.selected = e.srcElement.id;
    client.changePage(e.srcElement.id);
  }
}

module.exports = Nav;
