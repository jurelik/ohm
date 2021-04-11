const { session } = require('electron');
const io = require('../utils/io');
const log = require('../utils/log');

function LoginView() {
  this.el = document.createElement('div');

  this.getData = () => {
    const data = Array.from(this.el.querySelectorAll('input')).reduce((acc, input) => ({ ...acc, [input.name]: input.value }), {});

    //Handle empty fields
    if (data.artist === '') throw 'artist is missing';
    if (data.pw === '') throw 'password is missing';

    return data;
  }

  this.handleLogin = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const payload = this.getData();
      await io.login(payload);
      log.success('Succesfully logged in.');
      app.init();
    }
    catch (err) {
      throw err;
    }
  }

  this.init = async () => {
    //Create elements
    let spinner = document.createElement('div');

    //Add classes for styling
    this.el.className = 'login';
    spinner.className = 'spinner';

    //Build structure
    this.el.appendChild(spinner);

    document.querySelector('.root').appendChild(this.el); //Create a spinner while we try to login

    try {
      await io.login();
      log.success('Succesfully logged in.');
      app.init();
    }
    catch (err) {
      throw err;
    }
  }

  this.render = () => {
    this.el.innerHTML = ''; //Clean up this.el

    //Create elements
    let artist = document.createElement('input');
    let pw = document.createElement('input');
    let submit = document.createElement('button');

    //Add classes for styling
    this.el.className = 'login';

    //Add attributes and innerHTML
    artist.name = 'artist';
    pw.name = 'pw';
    submit.setAttribute('type', 'submit');
    submit.innerHTML = 'login';

    //Build structure
    this.el.appendChild(artist);
    this.el.appendChild(pw);
    this.el.appendChild(submit);

    //Add listeners
    submit.onclick = this.handleLogin;

    document.querySelector('.root').appendChild(this.el);
  }
}

module.exports = LoginView;
