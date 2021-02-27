const uploadAlbum = async (payload) => {
  try {
    //Check if album already exists
    for await (const album of app.ipfs.files.ls('/antik/albums')) {
      if (album.name === payload.album.title) throw 'album with the same name already exists';
    }

    app.ipfs.files.mkdir(`/antik/albums/${payload.album.title}/songs`, { parents: true }); //Create album folder

    //Add songs
    for (let song of payload.songs) {
      await addSong(song, payload);
    }

    //Get album CID
    const stats = await app.ipfs.files.stat(`/antik/albums/${payload.album.title}`);
    payload.album.cid = stats.cid.string;
    payload.album.tags = payload.album.tags.split(/[,;]+/); //Convert string into array
  }
  catch (err) {
    throw err;
  }
}

const uploadSingle = async (payload) => {
  try {
    const single = payload.songs[0];

    //Check if single already exists
    for await (const _single of app.ipfs.files.ls('/antik/singles')) {
      if (_single.name === single.title) throw 'single with the same name already exists';
    }

    //Add single
    await addSong(single, payload);
  }
  catch (err) {
    throw err;
  }
}

//Helpers
const addSong = async (song, payload) => {
  try {
    let format = song.file.name.slice(-3);
    let albumTitle = payload.album ? payload.album.title : null;
    let buffer = await song.file.arrayBuffer();
    let { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS
    let folder;

    if (albumTitle) {
      await app.ipfs.files.mkdir(`/antik/albums/${albumTitle}/songs/${song.title}/files`, { parents: true }); //Create a song folder for every song
      await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/albums/${albumTitle}/songs/${song.title}/antik - ${song.title}.${format}`); //Save song to MFS

      //Get song folder CID
      folder = await app.ipfs.files.stat(`/antik/albums/${albumTitle}/songs/${song.title}`);
    }
    else {
      await app.ipfs.files.mkdir(`/antik/singles/${song.title}/files`, { parents: true }); //Create single folder
      await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/singles/${song.title}/antik - ${song.title}.${format}`); //Save song to MFS

      //Get song folder CID
      folder = await app.ipfs.files.stat(`/antik/singles/${song.title}`);
    }

    //Clean up the object
    delete song.file;
    song.fileType = format;
    song.tags = song.tags.split(/[,;]+/); //Convert string into array
    song.cid = folder.cid.string;

    //Add Files
    for (let file of song.files) {
      await addFile(file, song.title, albumTitle);
    }
  }
  catch (err) {
    throw err;
  }
}

const addFile = async (file, songTitle, albumTitle) => {
  try {
    let format = file.file.name.slice(-3);
    let buffer = await file.file.arrayBuffer();
    let { cid } = await app.ipfs.add({ content: buffer }); //Add file to IPFS

    if (albumTitle) await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/albums/${albumTitle}/songs/${songTitle}/files/antik - ${file.name}.${format}` ); //add to album
    else await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/singles/${songTitle}/files/antik - ${file.name}.${format}` ); //add to single

    //Clean up the object
    delete file.file;
    file.fileType = format;
    file.cid = cid.string;
    file.tags = file.tags.split(/[,;]+/); //Convert string into array
  }
  catch (err) {
    throw err;
  }
}

module.exports = {
  uploadAlbum,
  uploadSingle
}
