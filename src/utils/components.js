const createSongElement = (_song) => {
  //Helper function - possibly move outside component?
  const toggleSounds = (song) => {
    if (song.children[1].className === 'files-hidden') return song.children[1].className = 'files-visible';
    return song.children[1].className = 'files-hidden';
  }

  //Create elements
  let song = document.createElement('div');
  let main = document.createElement('div');
  let sounds = document.createElement('div');
  let titleAndArtist = document.createElement('div');
  let art = document.createElement('img');
  let title = document.createElement('p');
  let artist = document.createElement('p');
  let toggle = document.createElement('button');
  let playButton = document.createElement('button');

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
  toggle.innerHTML = 'toggle';
  playButton.innerHTML = 'play/pause';

  //Add sound elements
  for (let sound of _song.sounds) {
    const el = createFileElement(sound);
    sounds.appendChild(el);
  }

  //Build structure
  song.appendChild(main);
  song.appendChild(sounds);
  main.appendChild(art);
  main.appendChild(titleAndArtist);
  titleAndArtist.appendChild(title);
  titleAndArtist.appendChild(artist);
  main.appendChild(toggle);
  main.appendChild(playButton);

  //Add listeners
  song.onclick = () => client.selectSong(_song);
  toggle.onclick = () => toggleSounds(song);
  playButton.onclick = () => client.player.play(_song);

  return song;
}

const createFileElement = (_file) => {
  //Create elements
  let file = document.createElement('div');
  let title = document.createElement('p');
  let artist = document.createElement('p'); let playButton = document.createElement('button');
  file.classList.add('file');

  //Add attributes and innerHTML
  title.innerHTML = _file.title;
  artist.innerHTML = _file.artist;
  playButton.innerHTML = 'play/pause';

  //Build structure
  file.appendChild(artist);
  file.appendChild(title);
  file.appendChild(playButton);

  //Add listeners
  playButton.onclick = () => client.player.play(_file);

  return file;
}

module.exports = {
  createSongElement,
  createFileElement
}
