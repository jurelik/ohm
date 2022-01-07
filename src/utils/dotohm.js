'use strict';

const generate = async (payload) => {
  try {
    const _payload = JSON.parse(JSON.stringify(payload)); //Make a copy of the payload so that the original does not get modified
    const artists = []; //Array of artists whose work is included in this upload

    //Delete unnecessary properties from payload/songs/files
    delete _payload.multiaddr;
    for (let song of _payload.songs) {
      delete song.path;
      delete song.cid;
      delete song.format;

      for (let file of song.files) {
        delete file.path;
        delete file.cid;

        artists.push(file.artist);
      }
    }

    let _artists = [...new Set(artists)]; //Remove duplicates
    _artists = _artists.filter(artist => artist !== app.artist); //Remove self

    const data =`     _
 ___| |_ _____
| . |   |     |
|___|_|_|_|_|_|

This is an automatically generated file which serves as a reference to all the artists
whose work is contained within the uploaded folder. This file also includes the upload
state of this upload in case it needs to be re-created in the future for any reason.

Copy the lines underneath to give credit to artists whose work is used in this upload:
======================================================================================

${_artists.length === 0 ? 'This upload does not include previous work of any other artists.' : `This work includes previous work of the following artists:
${_artists.join(', ')}`}

Upload state is saved underneath this line for the purpose of re-creating this upload:
======================================================================================

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
