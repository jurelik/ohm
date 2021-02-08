const { createSongElement } = require('./utils/components');

function Explore() {
  this.songs = [];

  this.init = () => {
    //Fetch songs
    this.demoId = 'aaa'
    this.demoFile1 = {
      id: 'bbb',
      type: 'original',
      title: 'demo1',
      url: '/ipfs/QmQpbUHhJgq7JeFMGDjXP22cREPYaMGa5TZnZ48dHDFQgc'
    }
    this.demoFile2 = {
      id: 'ccc',
      type: 'internal',
      title: 'demo2',
      artist: 'testArtist',
      url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy'
    }

    this.songs.push({
      id: this.demoId,
      title: 'testTitle',
      artist: 'testArtist',
      art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
      url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
      files: [ this.demoFile1, this.demoSound2 ]
    });

    //Render songs on first load
    this.render();
  }

  this.render = () => {
    for (let song of this.songs) {
      const el = createSongElement(song);
      client.content.appendChild(el);
    }
  }

//  this.toggleSounds = (song) => {
//    if (song.children[1].className === 'sounds-hidden') return song.children[1].className = 'sound-visible'
//    return song.children[1].className = 'sounds-hidden'
//  }
//
  //this.createSongElement = (_song) => {
  //  //Create elements
  //  let song = document.createElement('div');
  //  let main = document.createElement('div');
  //  let sounds = document.createElement('div');
  //  let titleAndArtist = document.createElement('div');
  //  let art = document.createElement('img');
  //  let title = document.createElement('p');
  //  let artist = document.createElement('p');
  //  let toggle = document.createElement('button');
  //  let playButton = document.createElement('button');

  //  //Add classes for styling
  //  song.classList.add('song');
  //  main.classList.add('main');
  //  sounds.classList.add('sounds-hidden');
  //  titleAndArtist.classList.add('titleAndArtist');
  //  art.classList.add('art');

  //  //Add attributes and innerHTML
  //  art.setAttribute('src', `http://127.0.0.1:8080${_song.art}`)
  //  title.innerHTML = _song.title;
  //  artist.innerHTML = _song.artist;
  //  toggle.innerHTML = 'toggle';
  //  playButton.innerHTML = 'play/pause';

  //  //Add sound elements
  //  for (let sound of _song.sounds) {
  //    const _el = this.createSoundElement(sound);
  //    sounds.appendChild(_el);
  //  }

  //  //Build structure
  //  song.appendChild(main);
  //  song.appendChild(sounds);
  //  main.appendChild(art);
  //  main.appendChild(titleAndArtist);
  //  titleAndArtist.appendChild(title);
  //  titleAndArtist.appendChild(artist);
  //  main.appendChild(toggle);
  //  main.appendChild(playButton);

  //  //Add listeners
  //  song.onclick = () => client.selectSong(_song);
  //  toggle.onclick = () => this.toggleSounds(song);
  //  playButton.onclick = () => client.player.play(_song);

  //  return song;
  //}

  //this.createSoundElement = (_sound) => {
  //  let sound = document.createElement('div');
  //  let title = document.createElement('p');
  //  let artist = document.createElement('p');
  //  let playButton = document.createElement('button');

  //  sound.classList.add('sound');

  //  //Add attributes and innerHTML
  //  title.innerHTML = _sound.title;
  //  artist.innerHTML = _sound.artist;
  //  playButton.innerHTML = 'play/pause';

  //  //Build structure
  //  sound.appendChild(artist);
  //  sound.appendChild(title);
  //  sound.appendChild(playButton);

  //  //Add listeners
  //  playButton.onclick = () => client.player.play(_sound);

  //  return sound;
  //}
}

module.exports = Explore;
