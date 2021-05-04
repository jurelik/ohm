const fsp = require('fs').promises;
const fs = require('fs');
const crypto = require('crypto');
const log = require('./log');

const addSong = async (song, path) => {
  try {
    const buffer = await fsp.readFile(song.path);
    const { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS

    //Copy song to MFS
    await app.ipfs.files.mkdir(`${path}/${song.title}/files`, { parents: true });
    await app.ipfs.files.cp(`/ipfs/${cid.string}`, `${path}/${song.title}/${app.artist} - ${song.title}.${song.format}`);

    //Add files
    for (const file of song.files) {
      const buffer = await fsp.readFile(file.path);
      const { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS

      //Copy file to MFS
      await app.ipfs.files.cp(`/ipfs/${cid.string}`, `${path}/${song.title}/files/${app.artist} - ${file.name}.${file.format}`);
      file.cid = cid.string;
    }

    //Get CID of folder
    const folder = await app.ipfs.files.stat(`${path}/${song.title}`);
    song.cid = folder.cid.string;
  }
  catch (err) {
    throw err;
  }
}

const generateTransferId = () => {
  const unique = crypto.randomBytes(6).toString('base64');//Generate unique ID
  if (app.transfersStore.get()[unique]) return generateTransferId(); //If the unique ID exists already, create a new one
  return unique;
}

const transferTimeout = (unique) => {
  return setTimeout(async () => {
    const transfer = app.transfersStore.getOne(unique);

    try {
      const stat = await app.ipfs.files.stat(`/ipfs/${transfer.cid}`, { withLocal: true, timeout: 2000, signal: transfer.controller.signal });
      const percentage = Math.round(stat.sizeLocal / stat.cumulativeSize * 100);
      app.transfersStore.update(unique, { progress: percentage }); //Update progress in transfersStore
      if (app.current === 'transfers' && app.views.transfers) app.views.transfers.children[unique].update('progress'); //Update progress in transfersView

      if (percentage === 100) return;
      transfer.timeout = transferTimeout(unique);
    }
    catch (err) {
      log.error(err.message)
      if (app.transfersStore.getOne(unique).active) transfer.timeout = transferTimeout(unique);
    }

  }, 1000);
}

const transferExists = (payload, type) => {
  const transfers = app.transfersStore.get();
  let unique = null;

  for (const _unique in transfers) {
    if (transfers[_unique].cid === payload.cid && transfers[_unique].albumTitle === payload.albumTitle && transfers[_unique].type === type) {
      unique = _unique;
      break;
    }
  }

  return unique;
}

const folderExists = async (transfer) => {
  try {
    //Check if album folder exists when dealing with a song inside an album
    if (transfer.albumTitle) {
      const albumExists = await albumFolderExists(transfer);
      if (!albumExists) return false;
    }

    //Check if folder exists already
    for await (const folder of app.ipfs.files.ls(transfer.path)) {
      if (folder.name === transfer.title) {
        //Check if CIDs are equal
        const { cid } = await app.ipfs.files.stat(`${transfer.path}/${transfer.title}`);
        if (cid.string === transfer.cid) return true;
      }
    }

    return false
  }
  catch (err) {
    return false;
  }
}

const createAlbumFolder = async (transfer) => {
  try {
    //Check if folder exists already
    for await (const folder of app.ipfs.files.ls(`/${transfer.artist}/albums`)) {
      if (folder.name === transfer.albumTitle) return;
    }

    await app.ipfs.files.mkdir(transfer.path);
  }
  catch (err) {
    throw err;
  }
}

const removeExistingAlbumFolder = async (transfer) => {
  try {
    //Check if folder exists already
    for await (const folder of app.ipfs.files.ls(`/${transfer.artist}/albums`)) {
      if (folder.name === transfer.title) return await app.ipfs.files.rm(`/${transfer.artist}/albums/${transfer.title}`, { recursive: true });
    }
  }
  catch (err) {
    throw err;
  }
}

const appendPinIcon = (cid) => {
  const songFound = appendPinIconToSong(cid);
  if (songFound) return; //Stop here if song is found
  appendPinIconToAlbum(cid);
}

const createMFSTransferPath = (payload) => {
  if (payload.type === 'album') return `/${payload.artist}/albums`;
  if (payload.albumTitle) return `/${payload.artist}/albums/${payload.albumTitle}`;
  return `/${payload.artist}/singles`;
}

const writeToDisk = async (transfer) => {
  try {
    log('Writing to disk...')
    await fsp.mkdir(`${process.env.HOME}/Documents/ohm${transfer.path}/${transfer.title}`, { recursive: true });

    for await (const file of app.ipfs.get(transfer.cid)) {
      if (!file.content) continue;

      //Write file to disk
      const fsPath = file.path.slice(file.path.indexOf('/') + 1);

      const path = await fsCreateSongFolder(transfer, fsPath); //Create song folder if it doesn't exist yet
      const stream = fs.createWriteStream(`${path}/${fsPath}`);
      for await (const chunk of file.content) stream.write(chunk);
      stream.end();
    }
    log('Successfully downloaded item.')
  }
  catch (err) {
    throw err;
  }
}

const pinItem = async (transfer, controller) => {
  try {
    log('Pinning...')
    await app.ipfs.pin.add(`/ipfs/${transfer.cid}`, { signal: controller.signal });
    if (transfer.albumTitle) await createAlbumFolder(transfer); //Create an album folder if needed
    if (transfer.album) await removeExistingAlbumFolder(transfer); //Check if folder exists and remove it
    await app.ipfs.files.cp(`/ipfs/${transfer.cid}`, `${transfer.path}/${transfer.title}`, { signal: controller.signal, parents: true });
    log('Successfully pinned item.')
  }
  catch (err) {
    throw err;
  }
}

const removePin = async (cid) => {
  try {
    for await (const pin of app.ipfs.pin.ls({ type: 'recursive' })) {
      if (pin.cid.string === cid) await app.ipfs.pin.rm(pin.cid, { recursive: true }); //Remove pin from IPFS
    }
  }
  catch (err) {
    return; //Ignore as this means that the file is no longer pinned already
  }
}

const garbageCollect = async () => {
  try {
    for await (const res of app.ipfs.repo.gc()) continue;
  }
  catch (err) {
    throw err;
  }
}

const childIsPlaying = (song, songs) => { //Check if a song within an album is playing
  for (let _song of songs) if (_song.id === song.id) return true;
  return false;
}

const removeItem = (data) => {
  const views = [ 'explore', 'feed', 'pinned', 'artist' ]; //Views to check
  const appItems = app[`${data.type}s`]; //Either app.songs or app.albums, depending on data.type

  for (const view of views) {
    if (!app.views[view]) continue; //Continue if one of the views hasn't been initiated yet
    removeDataAndChildren(view, data); //Remove item from this.data, this.children and this.el of the relevant view
  }

  for (const item of appItems) if (item.data.type === data.type && item.data.id === data.id) return appItems.splice(appItems.indexOf(item), 1); //Delete item from app.songs or app.albums
}

const handleReader = async (reader, previous) => {
  try {
    const { done, value } = await reader.read();
    var msg = new TextDecoder().decode(value);
    if (done) return JSON.parse(previous);

    if (!msg === '{"type":"success"}') log(`Upload progress: ${msg}%`);
    return await handleReader(reader, msg);
  }
  catch (err) {
    throw err;
  }
}

//
//PRIVATE FUNCTIONS
//
const updatePinnedState = (actionBar) => {
  actionBar.pinned = true; //Update pinned state
  actionBar.el.querySelector('.pin').innerHTML = 'unpin'; //Update .pin element
  actionBar.appendPinIcon(); //Append pin icon
}

const appendPinIconToSong = (cid) => {
  let amountPinned = 0; //Keep track of how many songs are pinned in order to update album pin status
  let songFound = false //Keep track of whether or not a song was found before checking the albums

  for (const song of app.songs) { //Check songs
    const actionBar = song.children.actionBar;

    if (song.data.cid === cid && song.children.actionBar) {
      songFound = true;
      if (!actionBar.pinned) updatePinnedState(actionBar);
    }
    if (actionBar.pinned) amountPinned++;
  }

  if (app.current === 'album' && songFound && amountPinned === app.songs.length) { //If all songs in album view are pinned, update the pin state of album as well
    const actionBar = app.albums[0].children.actionBar;
    if (!actionBar.pinned) updatePinnedState(actionBar);
  }
  if (songFound) return true;
}

const appendPinIconToAlbum = (cid) => {
  for (const album of app.albums) {
    if (album.data.cid === cid && album.children.actionBar) {
      const actionBar = album.children.actionBar;

      if (!actionBar.pinned) updatePinnedState(actionBar);
      if (app.current !== 'album') return; //Stop here if not currently in albumView

      //Append icon to all songs as well
      for (const song of app.songs) {
        const actionBar = song.children.actionBar;
        if (actionBar.pinned) continue; //If songs is already pinned move on
        updatePinnedState(actionBar);
      }
    }
  }
}

const albumFolderExists = async (transfer) => {
  try {
    const path = transfer.path.slice(0, transfer.path.lastIndexOf('/')); //Format path to not include albumTitle
    for await (const folder of app.ipfs.files.ls(path)) {
      if (folder.name === transfer.albumTitle) {
        return true;
      }
    }
    return false;
  }
  catch (err) {
    return false;
  }
}

const fsCreateSongFolder = async (transfer, fsPath) => {
  try {
    if (transfer.album) {
      const songTitle = fsPath.slice(0, fsPath.indexOf('/'));
      const path = `${process.env.HOME}/Documents/ohm${transfer.path}/${transfer.title}/${songTitle}/files`;
      if (!fs.existsSync(path)) await fsp.mkdir(path, { recursive: true });
    }
    else {
      const path = `${process.env.HOME}/Documents/ohm${transfer.path}/${transfer.title}/files`;
      if (!fs.existsSync(path)) await fsp.mkdir(path, { recursive: true });
    }

    return `${process.env.HOME}/Documents/ohm${transfer.path}/${transfer.title}`;
  }
  catch (err) {
    throw err;
  }
}

const removeDataAndChildren = (view, data) => {
  const children = app.views[view].children[`${data.type}s`]; //Choose children.songs or children.albums, depending on item type
  const _data = view === 'artist' ? app.views[view].artist : app.views[view].data; //Reference for this.data of the chosen view

  for (const id in children) {
    if (id === data.id.toString() && (view === 'pinned' || view === 'artist')) {
      const pinnedData =_data[`${data.type}s`]; //Reference to this.data.songs/albums of pinnedView due to different this.data structure
      children[id].el.remove(); //Delete from DOM
      delete children[id]; //Delete from this.children of view

      for (const item of pinnedData) if (id === item.id.toString()) pinnedData.splice(pinnedData.indexOf(item), 1); //Delete item from this.data of pinnedView
      break;
    }
    else if (id === data.id.toString()) {
      children[id].el.remove(); //Delete from DOM
      delete children[id]; //Delete from this.children of view
      for (const item of _data) if (item.type === data.type && id === item.id.toString()) _data.splice(_data.indexOf(item), 1); //Delete item from this.data of view
      break;
    }
  }
}

module.exports = {
  addSong,
  generateTransferId,
  transferTimeout,
  transferExists,
  folderExists,
  createAlbumFolder,
  removeExistingAlbumFolder,
  appendPinIcon,
  createMFSTransferPath,
  writeToDisk,
  pinItem,
  removePin,
  garbageCollect,
  childIsPlaying,
  removeItem,
  handleReader
}
