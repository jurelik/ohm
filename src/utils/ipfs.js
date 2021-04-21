const helpers = require('./helpers');
const log = require('./log');

const uploadSingle = async (payload) => {
  try {
    const song = payload.songs[0];
    await helpers.addSong(song, `/${app.artist}/singles`);
  }
  catch (err) {
    throw err;
  }
}

const uploadAlbum = async (payload) => {
  try {
    const album = payload.album;
    await app.ipfs.files.mkdir(`/${app.artist}/albums/${album.title}`);

    //Add songs
    for (const song of payload.songs) {
      await helpers.addSong(song,`/${app.artist}/albums/${album.title}`);
    }

    //Get CID of album folder
    const folder = await app.ipfs.files.stat(`/${app.artist}/albums/${album.title}`);
    album.cid = folder.cid.string;
  }
  catch (err) {
    throw err;
  }
}

const startTransfer = async (payload, _options) => {
  const options = _options || {}; //Initialise the options object if not provided

  try {
    const type = options.download ? 'download' : 'pin';
    const _unique = helpers.transferExists(payload, type); //Check if transfer already exists
    if (_unique) return resumeTransfer(_unique);

    //Create transfer
    const unique = helpers.generateTransferId(); //Generate unique id for the transfer
    const controller = new AbortController(); //Create abort controller to abort pin.add
    const path = helpers.createMFSTransferPath(payload); //Create MFS path where the song/album will be stored
    const transfer = {
      title: payload.title,
      artist: payload.artist,
      albumTitle: payload.albumTitle,
      album: payload.type === 'album' ? true : null,
      path,
      cid: payload.cid,
      type,
      progress: 0,
      active: true, //Is the timeout active
      completed: false,
      timeout: null,
      controller
    };

    app.transfersStore.add(unique, transfer); //Add transfer to transfersStore
    transfer.timeout = helpers.transferTimeout(unique); //Create an interval to update progress
    log('Transfer initiated..');

    const folderExists = await helpers.folderExists(transfer); //Check if folder exists already
    if (!folderExists) await helpers.pinItem(transfer, controller); //Add to MFS
    if (transfer.type === 'download') await helpers.writeToDisk(transfer); //Download to file system if download option is specified

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].reRender(); //Update transfersView if applicable
    helpers.appendPinIcon(transfer.cid); //Update pin icon if applicable

    log.success('Transfer succesfully completed.');
  }
  catch (err) {
    throw err;
  }
}

const resumeTransfer = async (unique) => {
  try {
    const transfer = app.transfersStore.getOne(unique);
    const controller = new AbortController();

    //Perform checks before resuming a transfer
    if (transfer.active) throw 'Transfer is already active'; //Check if transfer is already active
    const folderExists = await helpers.folderExists(transfer); //Check if song/album folder exists already
    if (transfer.completed && folderExists && transfer.type === 'pin') throw 'Transfer has already been completed'; //Check if item has already been pinned

    //Resume transfer
    app.transfersStore.update(unique, { active: true, completed: false, controller, timeout: helpers.transferTimeout(unique) });
    log('Transfer initiated..');

    if (!folderExists) await helpers.pinItem(transfer, controller); //Add to MFS
    if (transfer.type === 'download') await helpers.writeToDisk(transfer); //Download to file system if download option is specified

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].reRender(); //Update transferView if applicable
    helpers.appendPinIcon(transfer.cid); //Update pin icon if applicable

    log.success('Transfer succesfully completed.');
  }
  catch (err) {
    throw err;
  }
}

const pauseTransfer = async (unique) => {
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

const clearTransfer = async (unique) => {
  try {
    const transfer = app.transfersStore.getOne(unique);
    if (!transfer.completed) {
      if (transfer.active) { //Stop transfer if it is currently active
        transfer.controller.abort();
        clearTimeout(transfer.timeout);
      }
      await helpers.garbageCollect(); //Remove any data saved to IPFS
    }

    app.transfersStore.rm(unique);
    return app.views.transfersView.removeTransfer(unique);
  }
  catch (err) {
    throw err;
  }
}

const checkIfSongIsPinned = async (data) => {
  try {
    if (data.albumTitle) {
      if (await artistExists(data.artist) === false) return false; //Check if artist folder exists
      if (await albumExists(data) === false) return false; //Check if album folder exists

      const cid = await songInAlbumExists(data, data.albumTitle); //Get song CID
      if (!cid || cid !== data.cid) return false; //Check if CID matches
    }
    else {
      if (await artistExists(data.artist) === false) return false; //Check if artist folder exists

      const cid = await songExists(data); //Get song CID
      if (!cid || cid !== data.cid) return false; //Check if CID matches
    }
    return true;
  }
  catch (err) {
    console.error(err)
  }
}

const checkIfAlbumIsPinned = async (data) => {
  try {
    if (await artistExists(data.artist) === false) return false; //Check if artist folder exists
    const cid = await albumExists(data) //Get CID
    if (!cid || cid !== data.cid) return false; //Check if CID matches

    return true;
  }
  catch (err) {
    console.error(err)
  }
}

const unpinSong = async (payload) => {
  try {
    const path = payload.albumTitle ? `/${payload.artist}/albums/${payload.albumTitle}/` : `/${payload.artist}/singles/`;
    await app.ipfs.files.rm(`${path}${payload.title}`, { recursive: true });
    await helpers.removePin(payload.cid);
    log.success('Song unpinned.');
  }
  catch (err) {
    throw err;
  }
}

const unpinAlbum = async (payload) => {
  try {
    await app.ipfs.files.rm(`/${payload.artist}/albums/${payload.title}`, { recursive: true });
    await helpers.removePin(payload.cid);
    log.success('Album unpinned.');
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
        albums.push({ artist, title: file.name });
      }
      for await (const file of app.ipfs.files.ls(`/${artist}/singles`)) {
        const stat = await app.ipfs.files.stat(`/${artist}/singles/${file.name}`);
        songs.push(stat.cid.string);
      }
    }

    return { albums, songs };
  }
  catch (err) {
    log.error(err);
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
      if (file.name === (data.albumTitle || data.title) && file.type === 'directory') return file.cid.string;
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
  startTransfer,
  resumeTransfer,
  pauseTransfer,
  clearTransfer,
  checkIfSongIsPinned,
  checkIfAlbumIsPinned,
  unpinSong,
  unpinAlbum,
  getPinned,
  artistExists,
  songExists,
  albumExists,
  songInAlbumExists
}
