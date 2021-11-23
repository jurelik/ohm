'use strict';

const generate = async (path, payload) => {
  try {
    await app.ipfs.files.write(path, JSON.stringify(payload, null, 2), { create: true, cidVersion: 1 });
  }
  catch (err) {
    throw err;
  }
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
