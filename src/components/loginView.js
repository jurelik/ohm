const { session } = require('electron');
const io = require('../utils/io');
const log = require('../utils/log');

function LoginView() {
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
    //Create elements
    this.el = document.createElement('div');
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
