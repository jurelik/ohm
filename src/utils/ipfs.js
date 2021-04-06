const fsp = require('fs').promises;
const fs = require('fs');
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

const startTransfer = async (payload, _options) => {
  const options = _options || {}; //Initialise the options object if not provided

  try {
    log(payload);
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

const pinSong = async (payload) => {
  try {
    log(payload);
    const _unique = helpers.transferExists(payload.cid, payload.albumTitle); //Check if transfer already exists
    if (_unique) return resumePin(_unique);

    //Create transfer
    const unique = helpers.generateTransferId(); //Generate unique id for the transfer
    const controller = new AbortController(); //Create abort controller to abort pin.add
    const transfer = {
      title: payload.title,
      artist: payload.artist,
      albumTitle: payload.albumTitle,
      path: payload.albumTitle ? `/${payload.artist}/albums/${payload.albumTitle}/` : `/${payload.artist}/singles/`,
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
    if (payload.albumTitle) await helpers.createAlbumFolder(transfer); //Create an album folder if needed
    await app.ipfs.files.cp(`/ipfs/${payload.cid}`, `${transfer.path}${transfer.title}`, { signal: controller.signal, parents: true });

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].reRender(); //Update transfersView if applicable
    helpers.appendPinIcon(transfer.cid); //Update pin icon if applicable
    log.success('Song pinned.');
  }
  catch (err) {
    throw err;
  }
}

const unpinSong = async (payload) => {
  try {
    const path = payload.albumTitle ? `/${payload.artist}/albums/${payload.albumTitle}/` : `/${payload.artist}/singles/`;
    await app.ipfs.files.rm(`${path}${payload.title}`, { recursive: true });
    log.success('Song unpinned.');
  }
  catch (err) {
    throw err;
  }
}

const pinAlbum = async (payload) => {
  try {
    log(payload);
    const _unique = helpers.transferExists(payload.cid); //Check if transfer already exists
    if (_unique) return resumePin(_unique);

    //Create transfer
    const unique = helpers.generateTransferId(); //Generate unique id for the transfer
    const controller = new AbortController(); //Create abort controller to abort pin.add
    const transfer = {
      title: payload.title,
      artist: payload.artist,
      album: true,
      path: `/${payload.artist}/albums/`,
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
    await helpers.removeExistingAlbumFolder(transfer); //Check if folder exists (due to songs being pinned individually) and remove it
    await app.ipfs.files.cp(`/ipfs/${payload.cid}`, `${transfer.path}${transfer.title}`, { signal: controller.signal, parents: true });

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].reRender();
    helpers.appendPinIcon(transfer.cid); //Update pin icon if applicable
    log.success('Album pinned.');
  }
  catch (err) {
    throw err;
  }
}

const unpinAlbum = async (payload) => {
  try {
    await app.ipfs.files.rm(`/${payload.artist}/albums/${payload.title}`, { recursive: true });
    log.success('Album unpinned.');
  }
  catch (err) {
    throw err;
  }
}

const resumePin = async (unique) => {
  try {
    const transfer = app.transfersStore.getOne(unique);
    const controller = new AbortController();

    //Perform checks before resuming a transfer
    if (transfer.active) throw 'Transfer is already active'; //Check if transfer is already active
    const folderExists = await helpers.folderExists(transfer); //Check if song/album folder exists already
    if (transfer.completed && folderExists) throw 'Transfer has already been completed'; //Check if transfer has already been completed

    //Resume transfer
    app.transfersStore.update(unique, { active: true, completed: false, controller, timeout: helpers.transferTimeout(unique) });
    log('Transfer initiated..');

    //Add to MFS
    await app.ipfs.pin.add(`/ipfs/${transfer.cid}`, { signal: controller.signal });
    if (transfer.albumTitle) await helpers.createAlbumFolder(transfer); //Create an album folder if needed
    if (transfer.album) await helpers.removeExistingAlbumFolder(transfer); //Check if folder exists (due to songs being pinned individually) and remove it
    await app.ipfs.files.cp(`/ipfs/${transfer.cid}`, `${transfer.path}${transfer.title}`, { signal: controller.signal, parents: true });

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].reRender(); //Update transferView if applicable
    helpers.appendPinIcon(transfer.cid); //Update pin icon if applicable

    log.success(`${transfer.album ? 'Album' : 'Song'} pinned.`)
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

const downloadSong = async (payload) => {
  try {
    log(payload);
    //const _unique = helpers.transferExists(payload.cid, payload.albumTitle); //Check if transfer already exists
    //if (_unique) return resumePin(_unique);

    //Create transfer
    const unique = helpers.generateTransferId(); //Generate unique id for the transfer
    const controller = new AbortController(); //Create abort controller to abort pin.add
    const transfer = {
      title: payload.title,
      artist: payload.artist,
      albumTitle: payload.albumTitle,
      path: payload.albumTitle ? `/${payload.artist}/albums/${payload.albumTitle}/` : `/${payload.artist}/singles/`,
      cid: payload.cid,
      type: 'download',
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
    if (payload.albumTitle) await helpers.createAlbumFolder(transfer); //Create an album folder if needed
    await app.ipfs.files.cp(`/ipfs/${payload.cid}`, `${transfer.path}${transfer.title}`, { signal: controller.signal, parents: true });

    //Download to filesystem
    for await (const file of app.ipfs.get(payload.cid)) {
      if (!file.content) continue;

      //Write file to disk
      const fsPath = file.path.slice(file.path.indexOf('/') + 1);
      await fsp.mkdir(`${process.env.HOME}/Documents/ohm/${payload.artist}/singles/${payload.title}/files`, { recursive: true });
      const stream = fs.createWriteStream(`${process.env.HOME}/Documents/ohm/${payload.artist}/singles/${payload.title}/${fsPath}`);
      for await (const chunk of file.content) stream.write(chunk);
      stream.end();
    }

    clearTimeout(transfer.timeout);
    app.transfersStore.update(unique, { active: false, controller: null, completed: true, progress: 100 }); //Clean up transfer
    if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].reRender(); //Update transfersView if applicable
    helpers.appendPinIcon(transfer.cid); //Update pin icon if applicable
    log.success('Song downloaded.');
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
  pinSong,
  unpinSong,
  pinAlbum,
  unpinAlbum,
  resumePin,
  pausePin,
  getPinned,
  downloadSong,
  artistExists,
  songExists,
  albumExists,
  songInAlbumExists
}
