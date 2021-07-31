const log = require('../utils/log');
const ipfs = require('../utils/ipfs');
const Transfer = require('../components/transfer');

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

  this.removeAllTransfers = () => {
    for (const unique in this.children) this.children[unique].el.remove(); //Remove from DOM
    this.children = {}; //Re-initialize children

    this.transfers = app.transfersStore.get(); //Update state
  }

  this.handleClearAll = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      await ipfs.clearAllTransfers();
    }
    catch (err) {
      log.error(err);
    }
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
    let clearAll = document.createElement('button');

    actionsCell.className = 'actions-header';
    clearAll.className = 'clear-all';

    artistCell.textContent = 'artist';
    nameCell.textContent = 'name';
    typeCell.textContent = 'type';
    progressCell.textContent = 'progress';
    statusCell.textContent = 'status';
    actionsCell.textContent = 'actions';
    clearAll.textContent = 'clear all';

    header.appendChild(artistCell);
    header.appendChild(nameCell);
    header.appendChild(typeCell);
    header.appendChild(progressCell);
    header.appendChild(statusCell);
    header.appendChild(actionsCell);

    this.el.appendChild(table);
    table.appendChild(header);
    this.el.appendChild(clearAll);

    //Add classes for styling
    this.el.className = 'transfers-view';

    //Append transfers
    this.transfers = app.transfersStore.get();
    for (let unique in this.transfers) {
      let transfer = new Transfer(this.transfers[unique], unique);
      this.children[unique] = transfer;
      table.appendChild(transfer.render());
    }

    //Add listeners
    clearAll.onclick = this.handleClearAll;

    app.content.innerHTML = '';
    app.content.appendChild(this.el);
  }
}

module.exports = TransfersView;
