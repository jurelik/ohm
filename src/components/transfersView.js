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

  this.refresh = () => {
    this.render();
  }

  this.render = () => {
    this.el.innerHTML = '' //Reset innerHTML

    let table = document.createElement('table');
    let header = document.createElement('tr');
    let artistCell = document.createElement('th');
    let nameCell = document.createElement('th');
    let typeCell = document.createElement('th');
    let progressCell = document.createElement('th');
    let statusCell = document.createElement('th');
    let actionsCell = document.createElement('th');

    this.el.className = 'files';
    actionsCell.className = 'actions-header';

    artistCell.innerHTML = 'artist';
    nameCell.innerHTML = 'name';
    typeCell.innerHTML = 'type';
    progressCell.innerHTML = 'progress';
    statusCell.innerHTML = 'status';
    actionsCell.innerHTML = '';

    header.appendChild(artistCell);
    header.appendChild(nameCell);
    header.appendChild(typeCell);
    header.appendChild(progressCell);
    header.appendChild(statusCell);
    header.appendChild(actionsCell);

    this.el.appendChild(table);
    table.appendChild(header);

    //Add classes for styling
    this.el.className = 'transfers-view';

    //Append transfers
    this.transfers = app.transfersStore.get();
    for (let unique in this.transfers) {
      let transfer = new Transfer(this.transfers[unique], unique);
      this.children[unique] = transfer;
      table.appendChild(transfer.render());
    }

    app.content.appendChild(this.el);
    return this.el;
  }
}

module.exports = TransfersView;
