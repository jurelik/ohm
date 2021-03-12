const Store = require('./store');

function TransfersView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.transfers = null;

  this.render = async () => {
    try {
      //Create elements

      //Add classes for styling
      this.el.className = 'transfers-view';

      //Add attributes and innerHTML

      //Append transfers
      this.transfers = app.transfersStore.get();
      for (let key in this.transfers) {
        let test = document.createElement('p')
        test.innerHTML = this.transfers[key].artist + this.transfers[key].name;
        this.el.appendChild(test);
      }

      app.content.appendChild(this.el);
      return this.el;
    }
    catch (err) {
      console.error(err);
    }
  }
}

module.exports = TransfersView;
