const ipfs = require('../utils/ipfs');
const log = require('../utils/log');

const upload = async (payload) => {
  let writtenToMFS = false; //Keep track of whether or not MFS has been modified for error handling

  try {
    log('Adding to IPFS...');
    if (payload.album) await ipfs.uploadAlbum(payload);
    else await ipfs.uploadSingle(payload);
    writtenToMFS = true; //MFS has been modified
    log(`${payload.album ? 'Album' : 'Single'} added to IPFS...`);

    //Send payload to server
    log('Sending to mothership...');
    const _res = await fetch(`${app.URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const res = await _res.json();
    if (res.type === 'error') throw res.err;
  }
  catch (err) {
    if (err === 'album with the same name already exists') throw err;
    if (err === 'single with the same name already exists') throw err;;

    if (payload.album && writtenToMFS) await app.ipfs.files.rm(`/antik/albums/${payload.album.title}`, { recursive: true });
    else if (payload.songs.length > 0 && writtenToMFS) await app.ipfs.files.rm(`/antik/singles/${payload.songs[0].title}`, { recursive: true });
    throw err;
  }
}

const resumeUpload = async (transfer) => {
  try {
    if (transfer.payload.album) {
      unique = await ipfs.reUploadAlbum(transfer.payload);
    }
    else {
      unique = await ipfs.reUploadSingle(transfer.payload);
    }

    writtenToMFS = true; //MFS has been modified
    //Send payload to server
    const _res = await fetch(`${app.URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(transfer.payload)
    });

    const res = await _res.json();
    if (res.type === 'error') throw res.err;

    //Handle errors after this point differently as the song/album was already successfully uploaded by this point
    try {
      app.transfersStore.update(unique, { completed: true }); //Update status of transfer to completed
      if (app.views.transfersView) app.views.transfersView.children[transfer.payload.unique].handleComplete(); //Update status of transfer to completed
    }
    catch (err) {
      console.error(err);
    }
  }
  catch (err) {
    console.error(err);
    if (transfer.payload.album && writtenToMFS) await app.ipfs.files.rm(`/antik/albums/${transfer.payload.album.title}`, { recursive: true });
    else if (transfer.payload.songs.length > 0 && writtenToMFS) await app.ipfs.files.rm(`/antik/singles/${transfer.payload.songs[0].title}`, { recursive: true });
  }
}

module.exports = {
  upload,
  resumeUpload
}
