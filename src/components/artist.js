'use strict';

const log = require('../utils/log');
const { locationIcon } = require('../utils/svgs');

function Artist(data, view) {
  this.el = document.createElement('div');
  this.data = data;
  this.view = view; //Keep track of where component was created

  this.fetch = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const _res = await fetch(`${app.URL}/artist/${this.data}`);
        const res = await _res.json();

        if (res.type === 'error') return reject(res.err);
        resolve(res.payload);
      }
      catch (err) {
        reject(err);
      }
    });
  }

  this.handleFollow = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const following = this.data.following;
      let _res;

      if (following) _res = await fetch(`${app.URL}/unfollow/${this.data.id}`);
      else _res = await fetch(`${app.URL}/follow/${this.data.id}`);

      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      this.data.following = !following;

      //Update DOM
      const button = this.el.querySelector('.follow');
      button.textContent = this.data.following ? 'following' : 'follow';
      if (!this.data.following) button.classList.remove('following');
      else button.classList.add('following');
    }
    catch (err) {
      log.error(err);
    }
  }

  this.handleArtistClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    app.addToHistory('artist', { artist: this.data.name });
    app.changeView('artist', { artist: this.data.name });
  }

  this.render = () => {
    this.el.innerHTML = ''; //Reset innerHTML

    //Create elements
    let nameAndFollow = document.createElement('div');
    let name = document.createElement('button');
    let locationDiv = document.createElement('div');
    let location = document.createElement('p');

    //Add classes for styling
    this.el.className = 'artist-card';
    name.className = 'artist-name';
    nameAndFollow.className = 'name-and-follow';
    locationDiv.className = 'location-div';

    //Add attributes and innerHTML/textContent
    name.textContent = this.data.name;
    if (this.view === 'artist') name.disabled = true;
    locationDiv.innerHTML = locationIcon;
    location.textContent = this.data.location;

    //Build structure
    this.el.appendChild(nameAndFollow);
    nameAndFollow.appendChild(name);
    this.el.appendChild(locationDiv);
    locationDiv.appendChild(location);

    //Add listener
    if (this.view !== 'artist') name.onclick = this.handleArtistClick;

    if (this.data.name === app.artist) return this.el; //Return here if we are this is our own profile

    //Add follow button
    let follow = document.createElement('button');
    follow.classList.add('follow');
    if (this.data.following) follow.classList.add('following');
    follow.textContent = this.data.following ? 'following': 'follow';
    nameAndFollow.appendChild(follow);

    //Add listener
    follow.onclick = this.handleFollow;
    if (this.view !== 'artist') name.onclick = this.handleArtistClick;

    return this.el;
  }
}

module.exports = Artist;
