const ActionBar = require('./actionBar');

function Song(data, songView) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};
  this.playIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="408.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M443.75 255c-8.285 0-15 6.716-15 15h0v120c0 8.285 6.715 15 15 15h0l120-60c10-10 10-20 0-30h0l-120-60"/><path fill="none" d="M408.5 238.5h183v183h-183z"/></svg>';
  this.pauseIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="534.5 238.5 183 183"><path fill="#EEE" stroke="#EEE" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M566 255h0v150h30V255h-30m120 0h0-30v150h30V255"/><path fill="none" d="M534.5 238.5h183v183h-183z"/></svg>'

  this.handlePlayButton = (e, song) => {
    e.stopPropagation();
    client.playing ? e.target.innerHTML = this.playIcon : e.target.innerHTML = this.pauseIcon;
    client.player.queueFile(song)
  }

  this.render = () => {
    //Create elements
    let main = document.createElement('div');
    let titleAndArtist = document.createElement('div');
    let artist = document.createElement('p');
    let separator = document.createElement('p');
    let title = document.createElement('p');
    let playButton = document.createElement('button');

    //Add classes for styling
    this.el.classList.add('song');
    main.classList.add('main');
    titleAndArtist.classList.add('titleAndArtist');
    separator.classList.add('separator');

    //Add attributes and innerHTML
    artist.innerHTML = this.data.artist;
    separator.innerHTML = '•';
    title.innerHTML = this.data.title;
    playButton.innerHTML = this.playIcon;

    //Build structure
    this.el.appendChild(main);
    main.appendChild(playButton);
    main.appendChild(titleAndArtist);
    titleAndArtist.appendChild(artist);
    titleAndArtist.appendChild(separator);
    titleAndArtist.appendChild(title);

    //Add action bar
    if (!songView) {
      let actionBar = new ActionBar(this.data);
      this.el.appendChild(actionBar.render());
    }

    //Add listeners
    this.el.onclick = () => {
      client.addToHistory('song', { song: this.data, action: 'files' });
      client.changeView('song', { song: this.data, action: 'files' });
    }
    playButton.onclick = (e) => this.handlePlayButton(e, this.data);

    return this.el;
  }
}

module.exports = Song;
