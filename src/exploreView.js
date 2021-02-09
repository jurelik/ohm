const { createSongElement, createAlbumElement } = require('./utils/components');

function ExploreView() {
  this.list = [];

  this.init = () => {
    //Fetch songs
    this.demoFile1 = {
      id: 'bbb',
      type: 'original',
      fileType: 'wav',
      name: 'demo1',
      artist: 'testArtist',
      url: '/ipfs/QmQpbUHhJgq7JeFMGDjXP22cREPYaMGa5TZnZ48dHDFQgc',
      tags: ['kick', 'wav']
    }
    this.demoFile2 = {
      id: 'ccc',
      type: 'internal',
      fileType: 'wav',
      name: 'demo2',
      artist: 'testArtist',
      url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy',
      tags: ['snare', 'wav']
    }
    this.demoSong = {
      id: 'aaa',
      type: 'song',
      title: 'testTitle',
      artist: 'testArtist',
      art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
      url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
      files: [ this.demoFile1, this.demoFile2 ],
      comments: ['hi', 'ho'],
      pins: ['1', '2'],
      tags: ['lofi', 'hiphop']
    }

    this.demoSong2 = {
      id: 'aaa',
      type: 'song',
      title: 'testTitle',
      artist: 'testArtist',
      art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
      url: '/ipfs/QmTp7eeKm1ymt6SZD3SPMD3mKkAFomE8x5xtJhqK48a8qy',
      files: [ this.demoFile1, this.demoFile2 ],
      comments: ['he', 'ha'],
      pins: ['3', '4'],
      tags: ['lofi', 'hiphop']
    }

    this.list.push(this.demoSong);

    this.list.push({
      id: 'aaa',
      type: 'album',
      title: 'testAlbumTitle',
      artist: 'testAlbumArtist',
      art: '/ipfs/QmWVc2saSwaTy7h3j6idN8U2jL6kqhMsoReFsf56vwfXr6',
      songs: [this.demoSong2, this.demoSong],
      url: '/ipfs/QmU1B9JdMvhm4EB8kj487GfwQzfVtocKCm9XNAHkUtHz4f',
      tags: ['edm', 'dub']
    });

    //Render songs on first load
    this.render();
  }

  this.render = () => {
    for (let item of this.list) {
      let el;
      if (item.type === 'song') {
        el = createSongElement(item);
      }
      else if (item.type === 'album') {
        el = createAlbumElement(item);
      }
      else {
        continue;
      }
      client.content.appendChild(el);
    }
  }
}

module.exports = ExploreView;
