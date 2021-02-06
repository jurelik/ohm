function Explore() {
  this.songs = [];

  this.init = () => {
    //Fetch songs
    this.demoId = 'aaa'
    this.songs.push({
      id: this.demoId,
      title: 'testTitle',
      artist: 'testArtist',
      art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
      url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
      sounds: [ 'linkToSound1', 'linkToSound2' ]
    });

    //Render songs on first load
    this.render();
  }

  this.render = () => {
    for (let song of this.songs) {
      const el = this.createSongElement(song);
      client.content.appendChild(el);
    }
  }

  this.createSongElement = (song) => {
    let root = document.createElement('div');
    let titleAndArtist = document.createElement('div');
    let art = document.createElement('img');
    let title = document.createElement('p');
    let artist = document.createElement('p');
    let audio = document.createElement('audio');

    root.classList.add('song');
    root.onclick = () => client.selectSong(song);
    titleAndArtist.classList.add('titleAndArtist');
    art.classList.add('art');

    art.setAttribute('src', `http://127.0.0.1:8080${song.art}`)
    title.innerHTML = song.title;
    artist.innerHTML = song.artist;
    audio.setAttribute('src', `http://127.0.0.1:8080${song.url}`);
    audio.setAttribute('controls', `true`);

    root.appendChild(art);
    root.appendChild(titleAndArtist);
    titleAndArtist.appendChild(title);
    titleAndArtist.appendChild(artist);
    root.appendChild(audio);

    return root;
  }
}

module.exports = Explore;
