function ArtistView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.children = {
    song: null,
    files: {}
  };

  this.render = () => {
    this.el.innerHTML = 'hello world';

    return this.el;
  }

}

module.exports = ArtistView;
