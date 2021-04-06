const fsp = require('fs').promises;
const fs = require('fs');
const crypto = require('crypto');
const log = require('./log');
const pinIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="598.5 258.5 183 183"><path fill="none" stroke="#BBB" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" d="M720 350h0v30l45-45-45-45v30h-30m-30 30h0v-30l-45 45 45 45v-30h30m-30-30h60"/><path fill="none" d="M598.5 258.5h183v183h-183v-183z"/></svg></svg>'

const addSong = async (song, path) => {
  try {
    const buffer = await fsp.readFile(song.path);
    const { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS

    //Copy song to MFS
    await app.ipfs.files.mkdir(`${path}${song.title}/files`, { parents: true });
    await app.ipfs.files.cp(`/ipfs/${cid.string}`, `${path}${song.title}/antik - ${song.title}.${song.format}`);

    //Add files
    for (const file of song.files) {
      const buffer = await fsp.readFile(file.path);
      const { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS

      //Copy file to MFS
      await app.ipfs.files.cp(`/ipfs/${cid.string}`, `${path}${song.title}/files/antik - ${file.name}.${file.format}`);
      file.cid = cid.string;
    }

    //Get CID of folder
    const folder = await app.ipfs.files.stat(`${path}${song.title}`);
    song.cid = folder.cid.string;
  }
  catch (err) {
    throw err;
  }
}

const generateTransferId = () => {
  //Generate unique ID
  const unique = crypto.randomBytes(6).toString('base64');
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
      if (app.current === 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].update('progress'); //Update progress in transfersView

      if (percentage === 100) return;
      transfer.timeout = transferTimeout(unique);
    }
    catch (err) {
      console.error(err.message)
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

      const path = await createSongFolder(transfer, fsPath); //Create song folder if it doesn't exist yet
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

const createSongFolder = async (transfer, fsPath) => {
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
  pinItem
}
