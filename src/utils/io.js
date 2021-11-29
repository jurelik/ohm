'use strict';

const ipfs = require('../utils/ipfs');
const { ipcRenderer } = require('electron');
const helpers = require('../utils/helpers');
const log = require('../utils/log');

const login = async (payload) => {
  try {
    log('Attempting login...');
    const _res = await fetch(`${app.URL}/login`, {
      method: 'POST',
      credentials: 'include', //Include cookie
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : null
    });

    if (_res.status !== 200) throw new Error('FETCH_ERR');
    const res = await _res.json();
    if (res.type === 'error') throw new Error(res.err);

    app.artist = res.session.artist; //Set global artist value
  }
  catch (err) {
    throw err;
  }
}

const upload = async (payload) => {
  let writtenToMFS = false; //Keep track of whether or not MFS has been modified for error handling
  const path = (payload.album) ? `/${app.artist}/albums/${payload.album.title}` : `/${app.artist}/singles/${payload.songs[0].title}`;

  try {
    log('Adding to IPFS...');
    if (payload.album) await ipfs.uploadAlbum(payload);
    else await ipfs.uploadSingle(payload);
    writtenToMFS = true; //The directory has been written to MFS

    ipcRenderer.send('upload-start', path);
    log(`${payload.album ? 'Album' : 'Single'} added to IPFS...`);

    //Send payload to server
    log('Sending to mothership...');
    const _res = await fetch(`${app.URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    log('Connection established - Now uploading...');
    const reader = _res.body.getReader();
    const res = await helpers.handleReader(reader);

    if (res.type === 'error') throw new Error(res.err);
    ipcRenderer.send('upload-end');
  }
  catch (err) {
    ipcRenderer.send('upload-end');
    if (err.message === 'album with the same name already exists') throw err;
    if (err.message === 'single with the same name already exists') throw err;;

    if (writtenToMFS) await app.ipfs.files.rm(path, { recursive: true });
    throw err;
  }
}

const resumeUpload = async (transfer) => {
  try {
    if (transfer.payload.album) unique = await ipfs.reUploadAlbum(transfer.payload);
    else unique = await ipfs.reUploadSingle(transfer.payload);

    writtenToMFS = true; //MFS has been modified
    //Send payload to server
    const _res = await fetch(`${app.URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transfer.payload)
    });

    if (_res.status !== 200) throw new Error('FETCH_ERR');
    const res = await _res.json();
    if (res.type === 'error') throw new Error(res.err);

    //Handle errors after this point differently as the song/album was already successfully uploaded by this point
    try {
      app.transfersStore.update(unique, { completed: true }); //Update status of transfer to completed
      if (app.views.transfers) app.views.transfers.children[transfer.payload.unique].handleComplete(); //Update status of transfer to completed
    }
    catch (err) {
      log.error(err.message);
    }
  }
  catch (err) {
    if (err.message !== 'FETCH_ERR') log.error(err.message);
    if (transfer.payload.album && writtenToMFS) await app.ipfs.files.rm(`/${app.artist}/albums/${transfer.payload.album.title}`, { recursive: true });
    else if (transfer.payload.songs.length > 0 && writtenToMFS) await app.ipfs.files.rm(`/${app.artist}/singles/${transfer.payload.songs[0].title}`, { recursive: true });
  }
}

const deleteItem = async (data) => {
  try {
    const _res = await fetch(`${app.URL}/delete`, {
      method: 'POST',
      credentials: 'include', //Include cookie
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (_res.status !== 200) throw new Error('FETCH_ERR');
    const res = await _res.json();
    if (res.type === 'error') throw new Error(res.err);

    if (data.type === 'song' && await ipfs.checkIfSongIsPinned(data)) await ipfs.unpinSong(data);
    if (data.type === 'album' && await ipfs.checkIfAlbumIsPinned(data)) await ipfs.unpinAlbum(data);
  }
  catch (err) {
    throw err;
  }
}

const search = async (data) => {
  try {
    const _res = await fetch(`${app.URL}/search`, {
      method: 'POST',
      credentials: 'include', //Include cookie
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (_res.status !== 200) throw new Error('FETCH_ERR');
    const res = await _res.json();
    if (res.type === 'error') throw new Error(res.err);

    return res;
  }
  catch (err) {
    throw err;
  }
}

module.exports = {
  login,
  upload,
  resumeUpload,
  deleteItem,
  search
}
