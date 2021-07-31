const { session } = require('electron');
const io = require('../utils/io');
const log = require('../utils/log');
const { logo } = require('../utils/svgs');

function LoginView() {
  this.el = document.createElement('form');

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

      //Start spinner
      let spinner = document.createElement('div');
      spinner.className = 'spinner';
      document.querySelector('.main').innerHTML = '';
      document.querySelector('.main').appendChild(spinner);

      await io.login(payload);
      log.success('Succesfully logged in.');
      app.init();
    }
    catch (err) {
      this.render();
      log.error(err);
    }
  }

  this.init = async () => {
    //Create elements
    let main = document.createElement('div');
    let spinner = document.createElement('div');
    let logoDiv = document.createElement('div');

    //Add classes for styling
    this.el.className = 'login';
    main.className = 'main';
    spinner.className = 'spinner';
    logoDiv.className = 'logo-div'
    logoDiv.innerHTML = logo;

    //Build structure
    this.el.appendChild(logoDiv);
    this.el.appendChild(main);
    main.appendChild(spinner);

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
    let main = document.createElement('div');
    let logoDiv = document.createElement('div');
    let artistAndPw = document.createElement('div');
    let artist = document.createElement('input');
    let artistLabel = document.createElement('label');
    let pw = document.createElement('input');
    let pwLabel = document.createElement('label');
    let submit = document.createElement('button');

    //Add classes for styling
    this.el.className = 'login';
    main.className = 'main';
    logoDiv.className = 'logo-div';
    artistAndPw.className = 'artist-and-pw';
    pw.className = 'pw';

    //Add attributes and innerHTML
    logoDiv.innerHTML = logo;
    artist.name = 'artist';
    artist.setAttribute('type', 'text');
    artist.setAttribute('autofocus', true);
    artistLabel.textContent = 'artist: '
    pw.name = 'pw';
    pw.setAttribute('type', 'password');
    pwLabel.textContent = 'pw: '
    submit.setAttribute('type', 'submit');
    submit.textContent = 'login';

    //Build structure
    this.el.appendChild(logoDiv);
    this.el.appendChild(main);
    main.appendChild(artistAndPw);
    artistAndPw.appendChild(artistLabel);
    artistLabel.appendChild(artist);
    artistAndPw.appendChild(pwLabel);
    pwLabel.appendChild(pw);
    main.appendChild(submit);

    //Add listeners
    submit.onclick = this.handleLogin;

    document.querySelector('.root').appendChild(this.el);
  }
}

module.exports = LoginView;
