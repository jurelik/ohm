function PinnedView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {
    songs: {},
    albums: {}
  };

  this.render = async () => {
    try {
      //Get repo structure

      //Create elements
      let action = this.action || 'files';
      let song = new Song(data, 'songView');
      let main = new SongViewMain(data, action);

      //Add classes for styling
      this.el.className = 'pinned-view';

      //Add song child for remote control
      this.children.song = song;

      this.el.appendChild(await song.render());
      this.el.appendChild(main.render());

      app.content.appendChild(this.el);
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = PinnedView;
