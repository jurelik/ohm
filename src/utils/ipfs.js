const uploadAlbum = async (payload) => {
  try {
    //Check if album already exists
    for await (const album of app.ipfs.files.ls('/antik/albums')) {
      if (album.name === payload.album.title) throw 'album with the same name already exists';
    }

    app.ipfs.files.mkdir(`/antik/albums/${payload.album.title}/songs`, { parents: true }); //Create album folder

    //Add songs
    for (let song of payload.songs) {
      await addSongAlbum(song, payload);
    }

    //Get album CID
    const stats = await app.ipfs.files.stat(`/antik/albums/${payload.album.title}`);
    payload.album.cid = stats.cid.string;
  }
  catch (err) {
    throw err;
  }
}

const addSongAlbum = async (song, payload) => {
  try {
    let format = song.file.name.slice(-3);
    let buffer = await song.file.arrayBuffer();

    await app.ipfs.files.mkdir(`/antik/albums/${payload.album.title}/songs/${song.title}/files`, { parents: true }); //Create a song folder for every song

    let { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS, save it to MFS and update payload with CID
    await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/albums/${payload.album.title}/songs/${song.title}/antik - ${song.title}.${format}` );
    song.cid = cid.string;

    //Clean up the object
    delete song.file;
    song.fileType = format;

    //Add Files
    for (let file of song.files) {
      await addFileAlbum(file, payload, song.title);
    }
  }
  catch (err) {
    throw err;
  }
}

const addFileAlbum = async (file, payload, title) => {
  try {
    let format = file.file.name.slice(-3);
    let buffer = await file.file.arrayBuffer();

    let { cid } = await app.ipfs.add({ content: buffer }); //Add file to IPFS, save it to MFS and update payload with CID
    await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/albums/${payload.album.title}/songs/${title}/files/antik - ${file.name}.${format}` );
    file.cid = cid.string;

    //Clean up the object
    delete file.file;
    file.fileType = format;
  }
  catch (err) {
    throw err;
  }
}

module.exports = {
  uploadAlbum
}
