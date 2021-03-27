const fsp = require('fs').promises;
const crypto = require('crypto');

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
      const stat = await app.ipfs.files.stat(`/ipfs/${transfer.cid}`, { withLocal: true, timeout: 2000 });
      const percentage = Math.round(stat.sizeLocal / stat.cumulativeSize * 100);
      app.transfersStore.update(unique, { progress: percentage }); //Update progress in transfersStore
      if (app.current = 'transfers' && app.views.transfersView) app.views.transfersView.children[unique].update('progress'); //Update progress in transfersView

      if (percentage === 100) return;
      transfer.timeout = transferTimeout(unique);
    }
    catch (err) {
      console.error(err.message)
      if (transfer.active) transfer.timer = transferTimeout(unique);
    }

  }, 1000);
}

const transferExists = (cid) => {
  const transfers = app.transfersStore.get();
  let unique = null;

  for (const _unique in transfers) {
    if (transfers[_unique].cid === cid) {
      unique = _unique;
      break;
    }
  }

  return unique;
}

module.exports = {
  addSong,
  generateTransferId,
  transferTimeout,
  transferExists
}
