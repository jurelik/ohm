function Explore() {
  this.songs = [];

  this.init = () => {
    //Fetch songs
    this.demoId = 'aaa'
    this.demoSound1 = {
      type: 'original',
      name: 'demo1',
      url: 'ff'
    }
    this.demoSound2 = {
      type: 'internal',
      name: 'demo2',
      artist: 'testArtist',
      url: 'ff'
    }

    this.songs.push({
      id: this.demoId,
      title: 'testTitle',
      artist: 'testArtist',
      art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
      url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
      sounds: [ this.demoSound1, this.demoSound2 ]
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

  this.toggleSounds = (song) => {
    if (song.children[1].className === 'sounds-hidden') return song.children[1].className = 'sound-visible'
    return song.children[1].className = 'sounds-hidden'
  }

  this.createSongElement = (_song) => {
    //Create elements
    let song = document.createElement('div');
    let main = document.createElement('div');
    let sounds = document.createElement('div');
    let titleAndArtist = document.createElement('div');
    let art = document.createElement('img');
    let title = document.createElement('p');
    let artist = document.createElement('p');
    let audio = document.createElement('audio');
    let toggle = document.createElement('button');

    //Add classes for styling
    song.classList.add('song');
    main.classList.add('main');
    sounds.classList.add('sounds-hidden');
    titleAndArtist.classList.add('titleAndArtist');
    art.classList.add('art');

    //Add attributes and innerHTML
    art.setAttribute('src', `http://127.0.0.1:8080${_song.art}`)
    title.innerHTML = _song.title;
    artist.innerHTML = _song.artist;
    audio.setAttribute('src', `http://127.0.0.1:8080${_song.url}`);
    audio.setAttribute('controls', `true`);
    toggle.innerHTML = 'toggle';

    //Add sound elements
    for (let sound of _song.sounds) {
      const _el = this.createSoundElement(sound);
      sounds.appendChild(_el);
    }

    //Build structure
    song.appendChild(main);
    song.appendChild(sounds);
    main.appendChild(art);
    main.appendChild(titleAndArtist);
    titleAndArtist.appendChild(title);
    titleAndArtist.appendChild(artist);
    main.appendChild(audio);
    main.appendChild(toggle);

    //Add listeners
    song.onclick = () => client.selectSong(_song);
    toggle.onclick = () => this.toggleSounds(song);


    return song;
  }

  this.createSoundElement = (_sound) => {
    let sound = document.createElement('div');
    let name = document.createElement('p');
    let artist = document.createElement('p');
    let audio = document.createElement('audio');

    sound.classList.add('sound');

    //Add attributes and innerHTML
    name.innerHTML = _sound.name;
    artist.innerHTML = _sound.artist;
    audio.setAttribute('src', `http://127.0.0.1:8080${_sound.url}`);
    audio.setAttribute('controls', `true`);

    //Build structure
    sound.appendChild(artist);
    sound.appendChild(name);
    sound.appendChild(audio);

    return sound;
  }
}

module.exports = Explore;
