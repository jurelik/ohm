'use strict';

const generate = async (payload) => {
  try {
    const _payload = JSON.parse(JSON.stringify(payload)); //Make a copy of the payload so that the original does not get modified
    const artists = []; //Array of artists whose work is included in this upload

    //Delete unnecessary properties from payload/songs/files
    delete _payload.multiaddr;
    for (let song of _payload.songs) {
      delete song.path;
      for (let file of song.files) {
        delete file.path;
        artists.push(file.artist);
      }
    }

    let _artists = [...new Set(artists)]; //Remove duplicates
    _artists = _artists.filter(artist => artist !== app.artist); //Remove self

    const data =`     _
 ___| |_ _____
| . |   |     |
|___|_|_|_|_|_|

This is an automatically generated file which contains metadata related to an ohm upload.

Copy the text below to give credit to artists whose files are included in this upload:
=====================================================================================

${_artists.length === 0 ? 'This work does not include previous work of any other artists.' : `This work includes previous work of the following artists:
${_artists.join(', ')}`}

Copy the text below into an .ous file in order to re-create this upload and re-upload:
=====================================================================================
${JSON.stringify(_payload, null, 2)}`

    return data;
  }
  catch (err) {
    throw err;
  }
}

module.exports = {
  generate
}
