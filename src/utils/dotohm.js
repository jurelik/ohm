'use strict';

const generate = async (path, payload) => {
  try {
    const _payload = JSON.parse(JSON.stringify(payload)); //Make a copy of the payload so that the original does not get modified

    //Delete unnecessary properties from payload/songs/files
    delete _payload.multiaddr;
    for (let song of _payload.songs) {
      delete song.path;
      for (let file of song.files) delete file.path;
    }

    const data =`This is an automatically generated file which contains metadata related to an ohm upload.

Copy the text below to give credit to artists whose files are included in this upload:
=====================================================================================

This work includes previous work of the following artists:


Copy the text below into an .ous file in order to re-create this upload and re-upload:
=====================================================================================
${_payload}`

    await app.ipfs.files.write(path, JSON.stringify(data, null, 2), { create: true, cidVersion: 1 });
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
  generate
}
