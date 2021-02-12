let testData = [];

let demoFile1 = {
  id: 'bbb',
  type: 'original',
  fileType: 'wav',
  name: 'demo1',
  artist: 'testArtist',
  url: '/ipfs/QmQpbUHhJgq7JeFMGDjXP22cREPYaMGa5TZnZ48dHDFQgc',
  tags: ['kick', 'wav']
}

let demoFile2 = {
  id: 'ccc',
  type: 'internal',
  fileType: 'wav',
  name: 'demo2',
  artist: 'testArtist',
  url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy',
  tags: ['snare', 'wav']
}

let demoSong = {
  id: 'aaa',
  type: 'song',
  title: 'testTitle',
  artist: 'testArtist',
  art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
  url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
  files: [ demoFile1, demoFile2 ],
  comments: ['hi', 'ho'],
  pins: ['1', '2'],
  tags: ['lofi', 'hiphop']
}

let demoSong2 = {
  id: 'ddd',
  type: 'song',
  title: 'testTitle',
  artist: 'testArtist',
  art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
  url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy',
  files: [ demoFile1, demoFile2 ],
  comments: ['he', 'ha'],
  pins: ['3', '4'],
  tags: ['lofi', 'hiphop']
}

testData.push(demoSong);

testData.push({
  id: 'eee',
  type: 'album',
  title: 'testAlbumTitle',
  artist: 'testAlbumArtist',
  art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
  songs: [this.demoSong2, this.demoSong],
  url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
  tags: ['edm', 'dub']
});

module.exports = testData;