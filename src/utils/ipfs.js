const fsp = require('fs').promises;

const uploadSingle = async (payload) => {
  try {
    console.log(payload)
    const song = payload.songs[0];
    const buffer = await fsp.readFile(song.path);
    const { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS

    //Copy song to MFS
    await app.ipfs.files.mkdir(`/antik/singles/${song.title}/files`, { parents: true });
    await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/singles/${song.title}/antik - ${song.title}.${song.format}`);

    //Add files
    for (const file of song.files) {
      const buffer = await fsp.readFile(file.path);
      const { cid } = await app.ipfs.add({ content: buffer }); //Add song to IPFS

      //Copy file to MFS
      await app.ipfs.files.cp(`/ipfs/${cid.string}`, `/antik/singles/${song.title}/files/antik - ${file.name}.${file.format}`);
    }

    //Get CID of folder
    const folder = await app.ipfs.files.stat(`/antik/singles/${song.title}`);
    song.cid = folder.cid.string;
  }
  catch (err) {
    throw err;
  }
}

const uploadAlbum = async (payload) => {
  try {
    console.log(payload)
  }
  catch (err) {
    throw err;
  }
}

module.exports = {
  uploadSingle,
  uploadAlbum
}
