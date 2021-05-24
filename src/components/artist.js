const { locationIcon } = require('../utils/svgs');

function Artist(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {
    songs: {},
    albums: {}
  };

  this.fetch = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const _res = await fetch(`${app.URL}/api/artist/${this.data}`);
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

      if (following) _res = await fetch(`${app.URL}/api/unfollow/${this.data.id}`);
      else _res = await fetch(`${app.URL}/api/follow/${this.data.id}`);

      const res = await _res.json();
      if (res.type === 'error') throw new Error(res.err);

      this.data.following = !following;

      //Update DOM
      const button = this.el.querySelector('.follow');
      button.innerHTML = this.data.following ? 'following' : 'follow';
      if (!this.data.following) button.classList.remove('following');
      else button.classList.add('following');
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = () => {
    this.el.innerHTML = ''; //Reset innerHTML

    //Create elements
    let nameAndFollow = document.createElement('div');
    let name = document.createElement('div');
    let locationDiv = document.createElement('div');
    let location = document.createElement('p');

    //Add classes for styling
    this.el.className = 'artist';
    nameAndFollow.className = 'name-and-follow';
    locationDiv.className = 'location-div';

    //Add attributes and innerHTML
    name.innerHTML = this.data.name;
    locationDiv.innerHTML = locationIcon;
    location.innerHTML = this.data.location;

    //Build structure
    this.el.appendChild(nameAndFollow);
    nameAndFollow.appendChild(name);
    this.el.appendChild(locationDiv);
    locationDiv.appendChild(location);

    if (this.data.name === app.artist) return this.el;

    //Add follow button
    let follow = document.createElement('button');
    follow.classList.add('follow');
    if (this.data.following) follow.classList.add('following');
    follow.innerHTML = this.data.following ? 'following': 'follow';
    nameAndFollow.appendChild(follow);

    //Add listener
    follow.onclick = this.handleFollow;

    return this.el;
  }
}

module.exports = Artist;
