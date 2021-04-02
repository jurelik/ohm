const fsp = require('fs').promises;
const crypto = require('crypto');
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

const transferExists = (cid, albumTitle) => {
  const transfers = app.transfersStore.get();
  let unique = null;

  for (const _unique in transfers) {
    if (transfers[_unique].cid === cid && transfers[_unique].albumTitle === albumTitle) {
      unique = _unique;
      break;
    }
  }

  return unique;
}

const folderExists = async (path, name) => {
  try {
    //Check if folder exists already
    for await (const folder of app.ipfs.files.ls(path)) {
      if (folder.name === name) return true;
    }

    return false
  }
  catch (err) {
    throw err;
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

const removeExistingAlbumFolder = async (payload) => {
  try {
    //Check if folder exists already
    for await (const folder of app.ipfs.files.ls(`/${payload.artist}/albums`)) {
      if (folder.name === payload.title) return await app.ipfs.files.rm(`/${payload.artist}/albums/${payload.title}`, { recursive: true });
    }
  }
  catch (err) {
    throw err;
  }
}

const appendPinIcon = (cid) => {
  //Check songs
  for (const song of app.songs) {
    if (song.data.cid === cid && song.children.actionBar) {
      const actionBar = song.children.actionBar;

      actionBar.el.querySelector('.pin').innerHTML = 'unpin'; //Update .pin element

      //Append icon
      const icon = document.createElement('div');
      icon.className = 'pin-icon';
      icon.innerHTML = pinIcon;
      return actionBar.el.appendChild(icon);
    }
  }

  //Check albums
  for (const album of app.albums) {
    if (album.data.cid === cid && album.children.actionBar) {
      const actionBar = album.children.actionBar;

      actionBar.el.querySelector('.pin').innerHTML = 'unpin'; //Update .pin element

      //Append icon
      const icon = document.createElement('div');
      icon.className = 'pin-icon';
      icon.innerHTML = pinIcon;
      actionBar.el.appendChild(icon);

      if (app.current !== 'album') return;

      //If in albumView, append icon to all songs as well
      for (const song of app.songs) {
        const actionBar = song.children.actionBar;

        actionBar.pinned = true; //Update pinned state
        actionBar.el.querySelector('.pin').innerHTML = 'unpin'; //Update .pin element

        //Append icon
        const icon = document.createElement('div');
        icon.className = 'pin-icon';
        icon.innerHTML = pinIcon;
        actionBar.el.appendChild(icon);
      }
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
}
