const ipfs = require('../utils/ipfs');

const upload = async (payload) => {
  let writtenToMFS = false; //Keep track of whether or not MFS has been modified for error handling
  let unique = null;

  try {
    if (payload.album) {
      unique = await ipfs.uploadAlbum(payload);
    }
    else {
      unique = await ipfs.uploadSingle(payload);
    }

    writtenToMFS = true; //MFS has been modified
    //Send payload to server
    const _res = await fetch(`${app.URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const res = await _res.json();
    if (res.type === 'error') throw res.err;
    app.transfersStore.update(unique, { completed: true }); //Update status of transfer to completed
  }
  catch (err) {
    if (err === 'album with the same name already exists') return console.log(err);
    if (err === 'single with the same name already exists') return console.log(err);

    console.log(err);
    if (payload.album && writtenToMFS) await app.ipfs.files.rm(`/antik/albums/${payload.album.title}`, { recursive: true });
    else if (payload.songs.length > 0 && writtenToMFS) await app.ipfs.files.rm(`/antik/singles/${payload.songs[0].title}`, { recursive: true });
  }
}

const resumeUpload = async (transfer) => {
  try {
    if (transfer.payload.album) {
      unique = await ipfs.uploadAlbum(payload);
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
    app.transfersStore.update(unique, { completed: true }); //Update status of transfer to completed
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
