const Store = require('./store');
const Transfer = require('./transfer');

function TransfersView(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.transfers = null;
  this.children = {};

  this.addTransfer = (unique) => {
    this.transfers = app.transfersStore.get();

    //Append to DOM
    let transfer = new Transfer(this.transfers[unique]);
    this.children[unique] = transfer;
    this.el.appendChild(transfer.render());
  }

  this.render = async () => {
    try {
      //Create elements

      //Add classes for styling
      this.el.className = 'transfers-view';

      //Add attributes and innerHTML

      //Append transfers
      this.transfers = app.transfersStore.get();
      for (let key in this.transfers) {
        let transfer = new Transfer(this.transfers[key]);
        this.children[key] = transfer;
        this.el.appendChild(transfer.render());
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
