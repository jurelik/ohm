const crypto = require('crypto');
const fsp = require('fs').promises;

const uploadAlbum = async (payload) => {
  try {
    //Check if album already exists
    for await (const album of app.ipfs.files.ls('/antik/albums')) {
      if (album.name === payload.album.title && album.type === 'directory') throw 'album with the same name already exists';
    }

    app.ipfs.files.mkdir(`/antik/albums/${payload.album.title}/`, { parents: true }); //Create album folder

    //Create a unique ID for the transfer and add songs
    payload.unique = startTransferUpload(payload);
    for (let song of payload.songs) {
      await addSong(song, payload);
      app.transfersStore.update(payload.unique, { cycle: app.transfersStore.get()[payload.unique].cycle + 1 }); //Increment transfer cycle
    }

    //Get album CID
    const stats = await app.ipfs.files.stat(`/antik/albums/${payload.album.title}`);
    payload.album.cid = stats.cid.string;

    return payload.unique;
  }
  catch (err) {
    throw err;
  }
}

const reUploadAlbum = async (payload) => {
  try {
    //Delete folder in MFS if it was previously created
    for await (const album of app.ipfs.files.ls('/antik/albums')) {
      if (album.name === payload.album.title && album.type === 'directory') app.ipfs.files.rm(`/antik/albums/${payload.album.title}`, { recursive: true });
    }

    //Create a new folder
    app.ipfs.files.mkdir(`/antik/albums/${payload.album.title}/`, { parents: true }); //Create album folder

    //Add songs
    for (let song of payload.songs) {
      await addSong(song, payload);
      app.transfersStore.update(payload.unique, { cycle: app.transfersStore.get()[payload.unique].cycle + 1 }); //Increment transfer cycle
    }

    //Get album CID
    const stats = await app.ipfs.files.stat(`/antik/albums/${payload.album.title}`);
    payload.album.cid = stats.cid.string;

    return payload.unique;
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
      if (_single.name === single.title && _single.type === 'directory') throw 'single with the same name already exists';
    }

    //Create a unique ID for the transfer and add single
    payload.unique = startTransferUpload(payload);
    await addSong(single, payload);
    app.transfersStore.update(payload.unique, { cycle: app.transfersStore.get()[payload.unique].cycle + 1 }); //Increment transfer cycle

    return payload.unique;
  }
  catch (err) {
    throw err;
  }
}

const reUploadSingle = async (payload) => {
  try {
    const single = payload.songs[0];

    //Delete folder in MFS if it was previously created
    for await (const _single of app.ipfs.files.ls('/antik/singles')) {
      if (_single.name === single.title && _single.type === 'directory') app.ipfs.files.rm(`/antik/singles/${single.title}`, { recursive: true });
    }

    //Add single
    await addSong(single, payload);
    app.transfersStore.update(payload.unique, { cycle: app.transfersStore.get()[payload.unique].cycle + 1 }); //Increment transfer cycle

    return payload.unique;
  }
  catch (err) {
    throw err;
  }
}

const artistExists = async (artist) => {
  try {
    for await (const file of app.ipfs.files.ls('/')) {
      if (file.name === artist && file.type === 'directory') return true;
    }

    return false;
  }
  catch (err) {
    throw err;
  }
}

const songExists = async (data) => {
  try {
    for await (const file of app.ipfs.files.ls(`/${data.artist}/singles/`)) {
      if (file.name === data.title && file.type === 'directory') return file.cid.string;
    }
    return false;
  }
  catch (err) {
    throw err;
  }
}

const albumExists = async (data) => {
  try {
    for await (const file of app.ipfs.files.ls(`/${data.artist}/albums/`)) {
      if (file.name === data.title && file.type === 'directory') return file.cid.string;
    }
    return false;
  }
  catch (err) {
    throw err;
  }
}

const songInAlbumExists = async (data, albumTitle) => {
  try {
    for await (const file of app.ipfs.files.ls(`/${data.artist}/albums/${albumTitle}/`)) {
      if (file.name === data.title && file.type === 'directory') return file.cid.string;
    }
    return false;
  }
  catch (err) {
    throw err;
  }
}

const pinSong = async (data, albumTitle) => {
  try {
    //Create transfer

    //Create folder if it doesn't exist yet
    //if (albumTitle && await albumExists({ artist: data.artist, title: albumTitle }) === false) await app.ipfs.files.mkdir(`/${data.artist}/albums/${albumTitle}`);
    //if (!albumTitle && await songExists({ artist: data.artist, title: data.title }) === false) await app.ipfs.files.mkdir(`/${data.artist}/singles/${data.title}`);

    const unique = startTransferPin(data, albumTitle);
    await app.ipfs.pin.add(`/ipfs/${data.cid}`);

    //Copy to MFS
    if (albumTitle) await app.ipfs.files.cp(`/ipfs/${data.cid}`, `/${data.artist}/albums/${albumTitle}/${data.title}`, { parents: true });
    else await app.ipfs.files.cp(`/ipfs/${data.cid}`, `/${data.artist}/singles/${data.title}`, { parents: true });

    app.transfersStore.update(unique, { completed: true }); //Update status of transfer to completed
    if (app.views.transfersView) app.views.transfersView.children[unique].handleComplete(); //Update status of transfer to completed
  }
  catch (err) {
    throw err;
  }
}

const unpinSong = async (data, albumTitle) => {
  try {
    if (albumTitle) await app.ipfs.files.rm(`/${data.artist}/albums/${albumTitle}/${data.title}`, { recursive: true });
    else await app.ipfs.files.rm(`/${data.artist}/singles/${data.title}`, { recursive: true });
  }
  catch (err) {
    throw err;
  }
}

const pinAlbum = async (data) => {
  try {
    //Delete previous folders if they exist (due to only a song being pinned etc.)
    if (await albumExists(data)) await app.ipfs.files.rm(`/${data.artist}/albums/${data.title}`, { recursive: true });

    await app.ipfs.files.cp(`/ipfs/${data.cid}`, `/${data.artist}/albums/${data.title}`, { parents: true });
  }
  catch (err) {
    throw err;
  }
}

const unpinAlbum = async (data) => {
  try {
    await app.ipfs.files.rm(`/${data.artist}/albums/${data.title}`, { recursive: true });
  }
  catch (err) {
    throw err;
  }
}

const getPinned = async () => {
  try {
    const artists = [];
    const albums = [];
    const songs = [];

    for await (const file of app.ipfs.files.ls(`/`)) artists.push(file.name); //Get artists
    for (const artist of artists) {
      for await (const file of app.ipfs.files.ls(`/${artist}/albums`)) { //Get albums
        const stat = await app.ipfs.files.stat(`/${artist}/albums/${file.name}`);
        albums.push(stat.cid.string);
      }
      for await (const file of app.ipfs.files.ls(`/${artist}/singles`)) {
        const stat = await app.ipfs.files.stat(`/${artist}/singles/${file.name}`);
        songs.push(stat.cid.string);
      }
    }

    const _res = await fetch(`${app.URL}/api/pinned`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        albums,
        songs
      })
    });

    const res = await _res.json();
    if (res.type === 'error') throw res.err;

    return res.payload;
  }
  catch (err) {
    console.error(err);
  }
}

//Helpers
const handleProgress = (prog, size, unique) => {
  const transfer = app.transfersStore.get()[unique];
  const percentage = Math.round((prog / size * 100 / transfer.songsAmt) + (100 / transfer.songsAmt * transfer.cycle));
  app.transfersStore.update(unique, { progress: percentage }); //Update progress in transfersStore
  if (app.views.transfersView) app.views.transfersView.children[unique].update('progress'); //Update progress in transfersView
}

const startTransferPin = (payload) => {
  //Generate unique ID
  const unique = crypto.randomBytes(6).toString('base64');
  payload.unique = unique;
  if (app.transfersStore.get()[unique]) return startTransferUpload(payload); //If the unique ID exists already, create a new one

  //Start transfer
  const transfer = app.transfersStore.add(unique, {
    payload,
    name: payload.album ? payload.album.title : payload.title,
    artist: 'antik', //For testing purposes
    album: payload.album ? true : false,
    songsAmt: payload.album ? payload.songs.length : 1, //Get song amount to calculate progress
    type: 'pin',
    progress: 0,
    completed: false
  });

  if (app.views.transfersView) app.views.transfersView.addTransfer(unique); //Add transfer to transferView

  transferInterval(transfer); //Create an interval to update progress

  return unique;
}

const transferInterval = (transfer) => {
  const interval = setInterval(async () => {
    try {
      const stat = await app.ipfs.files.stat(`/ipfs/${transfer.payload.cid}`, { withLocal: true });
      console.log(stat)
      const percentage = Math.round(stat.sizeLocal / stat.cumulativeSize * 100);
      app.transfersStore.update(transfer.payload.unique, { progress: percentage }); //Update progress in transfersStore
      if (app.views.transfersView) app.views.transfersView.children[transfer.payload.unique].update('progress'); //Update progress in transfersView

      if (percentage === 100) clearInterval(interval);
    }
    catch (err) {
      throw err;
    }
  }, 1000);

  return interval;
}

const startTransferUpload = (payload) => {
  //Generate unique ID
  const unique = crypto.randomBytes(6).toString('base64');
  if (app.transfersStore.get()[unique]) return startTransferUpload(payload); //If the unique ID exists already, create a new one

  //Start transfer
  app.transfersStore.add(unique, {
    payload,
    name: payload.album ? payload.album.title : payload.songs[0].title,
    artist: 'antik', //For testing purposes
    album: payload.album ? true : false,
    songsAmt: payload.album ? payload.songs.length : 1, //Get song amount to calculate progress
    type: 'upload',
    progress: 0, //In percent
    cycle: 0, //Keep track of how many songs have been added
    completed: false
  });

  if (app.views.transfersView) app.views.transfersView.addTransfer(unique); //Add transfer to transferView

  return unique;
}

const addSong = async (song, payload) => {
  try {
    let folder;
    let format = song.filePath.slice(-3);
    let albumTitle = payload.album ? payload.album.title : null;
    let buffer = await fsp.readFile(song.filePath);
    let { cid } = await app.ipfs.add({ content: buffer }, { progress: (prog) => handleProgress(prog, buffer.byteLength, payload.unique) } ); //Add song to IPFS

    if (albumTitle) { //If song is part of album
      await app.ipfs.files.mkdir(`/antik/albums/${albumTitle}/${song.title}/files`, { parents: true }); //Create a song folder for every song
      await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/albums/${albumTitle}/${song.title}/antik - ${song.title}.${format}`); //Save song to MFS

      //Add Files
      for (let file of song.files) {
        await addFile(file, song.title, albumTitle);
      }

      //Get song folder CID
      folder = await app.ipfs.files.stat(`/antik/albums/${albumTitle}/${song.title}`);
    }
    else {
      await app.ipfs.files.mkdir(`/antik/singles/${song.title}/files`, { parents: true }); //Create single folder
      await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/singles/${song.title}/antik - ${song.title}.${format}`); //Save song to MFS

      //Add Files
      for (let file of song.files) {
        await addFile(file, song.title, albumTitle);
      }

      //Get song folder CID
      folder = await app.ipfs.files.stat(`/antik/singles/${song.title}`);
    }

    //Add cid and fileType to song
    song.cid = folder.cid.string;
    song.fileType = format;
  }
  catch (err) {
    throw err;
  }
}

const addFile = async (file, songTitle, albumTitle) => {
  try {
    if (file.type === 'internal') return;

    let format = file.filePath.slice(-3);
    let buffer = await fsp.readFile(file.filePath);
    let { cid } = await app.ipfs.add({ content: buffer }); //Add file to IPFS

    if (albumTitle) await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/albums/${albumTitle}/${songTitle}/files/antik - ${file.name}.${format}` ); //add to album
    else await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/singles/${songTitle}/files/antik - ${file.name}.${format}` ); //add to single

    //Add cid and fileType to song
    file.fileType = format;
    file.cid = cid.string;
  }
  catch (err) {
    throw err;
  }
}

module.exports = {
  uploadAlbum,
  reUploadAlbum,
  uploadSingle,
  reUploadSingle,
  artistExists,
  songExists,
  albumExists,
  songInAlbumExists,
  pinSong,
  unpinSong,
  pinAlbum,
  unpinAlbum,
  getPinned
}
