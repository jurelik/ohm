function uploadView(data) {
  this.el = document.createElement('div');
  this.data = data;

  this.render = () => {
    //Create elements
    let test = document.createElement('p');

    //Add classes for styling
    this.el.className = 'upload';

    //Add attributes and innerHTML
    test.innerHTML = 'upload here';

    //Build structure
    this.el.appendChild(test);

    return app.content.appendChild(this.el);
  }
}

module.exports = uploadView;
