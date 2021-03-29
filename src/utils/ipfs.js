const fsp = require('fs').promises;
const helpers = require('./helpers');
const log = require('./log');

const uploadSingle = async (payload) => {
  try {
    const song = payload.songs[0];
    await helpers.addSong(song, '/antik/singles/');
  }
  catch (err) {
    throw err;
  }
}

const uploadAlbum = async (payload) => {
  try {
    const album = payload.album;
    await app.ipfs.files.mkdir(`/antik/albums/${album.title}`);

    //Add songs
    for (const song of payload.songs) {
      await helpers.addSong(song,`/antik/albums/${album.title}/`);
    }

    //Get CID of album folder
    const folder = await app.ipfs.files.stat(`/antik/albums/${album.title}`);
    album.cid = folder.cid.string;
  }
  catch (err) {
    throw err;
  }
}

const pinSong = async (payload) => {
  try {
    log(payload);
    if (helpers.transferExists(payload.cid)) throw 'Transfer exists already.'; //Check if transfer already exists

    //Create transfer
    const unique = helpers.generateTransferId(); //Generate unique id for the transfer
    const controller = new AbortController(); //Create abort controller to abort pin.add
    const transfer = {
      name: payload.title,
      artist: payload.artist,
      path: app.current === 'album' ? `/${payload.artist}/albums/${app.views.albumView.data.title}/` : `/${payload.artist}/singles/`,
      cid: payload.cid,
      type: 'pin',
      progress: 0,
      active: true, //Is the timeout active
      completed: false,
      timeout: null,
      controller
    };

    app.transfersStore.add(unique, transfer); //Add transfer to transfersStore
    transfer.timeout = helpers.transferTimeout(unique); //Create an interval to update progress
    log('Transfer initiated..');

    //Add to MFS
    await app.ipfs.pin.add(`/ipfs/${payload.cid}`, { signal: controller.signal });
    await app.ipfs.files.cp(`/ipfs/${payload.cid}`, `${transfer.path}${transfer.name}`, { signal: controller.signal });

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].reRender();
  }
  catch (err) {
    throw err;
  }
}

const unpinSong = async (payload) => {
  try {
    const path = app.current === 'album' ? `/${payload.artist}/albums/${app.views.albumView.data.title}/` : `/${payload.artist}/singles/`;
    await app.ipfs.files.rm(`${path}${payload.title}`, { recursive: true });
  }
  catch (err) {
    throw err;
  }
}

const resumePin = async (unique) => {
  try {
    const controller = new AbortController();
    const transfer = app.transfersStore.getOne(unique);

    //Resume transfer
    app.transfersStore.update(unique, { active: true, controller, timeout: helpers.transferTimeout(unique) });
    log('Transfer initiated..');

    //Add to MFS
    await app.ipfs.pin.add(`/ipfs/${transfer.cid}`, { signal: controller.signal });
    await app.ipfs.files.cp(`/ipfs/${transfer.cid}`, `${transfer.path}${transfer.name}`, { signal: controller.signal });

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].update('completed'); //Update progress in transfersView
  }
  catch (err) {
    throw err;
  }
}

const pausePin = async (unique) => {
  try {
    const transfer = app.transfersStore.getOne(unique);

    //Resume transfer
    app.transfersStore.update(unique, { active: false });
    transfer.controller.abort();
    clearTimeout(transfer.timeout);
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

    return { albums, songs };
  }
  catch (err) {
    console.error(err);
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

module.exports = {
  uploadSingle,
  uploadAlbum,
  pinSong,
  unpinSong,
  resumePin,
  pausePin,
  getPinned,
  artistExists,
  songExists,
  albumExists,
  songInAlbumExists
}
