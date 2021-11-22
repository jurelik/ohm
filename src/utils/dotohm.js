'use strict';

const generate = () => {

}

const getOus = (e) => {
  e.stopPropagation();
  e.preventDefault();

  const data = {
    album: null,
    songs: []
  }

  if (this.children.length > 1) data.album = this.album.getAlbumData(true);
  for (const child of this.children) data.songs.push(child.getSongData(true));
}

module.exports = {
}
