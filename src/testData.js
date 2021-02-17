let testData = [];

let demoFile1 = {
  id: 'aaa',
  type: 'original',
  fileType: 'wav',
  name: 'demo1',
  artist: 'testArtist',
  url: '/ipfs/QmQpbUHhJgq7JeFMGDjXP22cREPYaMGa5TZnZ48dHDFQgc',
  tags: ['kick', 'hiphop']
}

let demoFile2 = {
  id: 'bbb',
  type: 'internal',
  fileType: 'wav',
  name: 'demo2',
  artist: 'testArtist',
  url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy',
  tags: ['snare', 'hiphop']
}

let demoFile3 = {
  id: 'ccc',
  type: 'internal',
  fileType: 'wav',
  name: 'demo3',
  artist: 'testArtistX',
  url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
  tags: ['snare', 'hiphop']
}

let demoSong = {
  id: 'ddd',
  type: 'song',
  fileType: 'mp3',
  title: 'testTitle1',
  artist: 'testArtist1',
  art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
  url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
  files: [ demoFile1, demoFile2, demoFile3 ],
  comments: ['hi', 'ho'],
  pins: ['1', '2'],
  tags: ['lofi', 'hiphop']
}

let demoSong2 = {
  id: 'eee',
  type: 'song',
  fileType: 'wav',
  title: 'testTitle2',
  artist: 'testArtist2',
  art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
  url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy',
  files: [ demoFile1, demoFile2 ],
  comments: ['he', 'ha'],
  pins: ['3', '4'],
  tags: ['lofi', 'hiphop']
}

let demoSong3 = {
  id: 'fff',
  type: 'song',
  fileType: 'wav',
  title: 'testTitle3',
  artist: 'testArtist3',
  art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
  url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy',
  files: [ demoFile1, demoFile2 ],
  comments: ['he', 'ha'],
  pins: ['3', '4'],
  tags: ['lofi', 'hiphop']
}

let demoSong4 = {
  id: 'ggg',
  type: 'song',
  fileType: 'wav',
  title: 'testTitle4',
  artist: 'testArtist4',
  art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
  url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
  files: [ demoFile1, demoFile2 ],
  comments: ['he', 'ha'],
  pins: ['3', '4'],
  tags: ['lofi', 'hiphop']
}

testData.push(demoSong);
testData.push(demoSong2);

testData.push({
  id: 'eee',
  type: 'album',
  title: 'testAlbumTitle',
  artist: 'testAlbumArtist',
  songs: [demoSong3, demoSong4],
  url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
  tags: ['edm', 'dub']
});

module.exports = testData;
