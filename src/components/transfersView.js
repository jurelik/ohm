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

  this.removeTransfer = (unique) => {
    this.children[unique].el.remove(); //Remove from DOM
    delete this.children[unique]; //Remove from children

    this.transfers = app.transfersStore.get(); //Update state
  }

  this.render = async () => {
    try {
      //Create elements

      //Add classes for styling
      this.el.className = 'transfers-view';

      //Add attributes and innerHTML

      //Append transfers
      this.transfers = app.transfersStore.get();
      for (let unique in this.transfers) {
        let transfer = new Transfer(this.transfers[unique], unique);
        this.children[unique] = transfer;
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
