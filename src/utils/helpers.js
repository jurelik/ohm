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

module.exports = {
  addSong
}
