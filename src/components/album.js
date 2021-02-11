function Album(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.render = () => {
    //Create elements
    let main = document.createElement('div');
    let titleAndArtist = document.createElement('div');
    let art = document.createElement('img');
    let title = document.createElement('p');
    let artist = document.createElement('p');
    let playButton = document.createElement('button');

    //Add classes for styling
    this.el.classList.add('album');
    main.classList.add('main');
    titleAndArtist.classList.add('titleAndArtist');
    art.classList.add('art');

    //Add attributes and innerHTML
    art.setAttribute('src', `http://127.0.0.1:8080${data.art}`)
    title.innerHTML = data.title;
    artist.innerHTML = data.artist;
    playButton.innerHTML = 'play/pause';

    //Build structure
    this.el.appendChild(main);
    main.appendChild(art);
    main.appendChild(titleAndArtist);
    titleAndArtist.appendChild(title);
    titleAndArtist.appendChild(artist);
    main.appendChild(playButton);

    //Add listeners
    this.el.onclick = () => app.selectAlbum(data);
    playButton.onclick = () => app.player.queueFiles(data.songs);

    return this.el;
  }
}

module.exports = Album;
