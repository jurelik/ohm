'use strict';

const log = require('../utils/log');
let Comment = require('./comment');

function Comments(data) {
  this.el = document.createElement('div');
  this.data = data;
  this.state = {};

  this.handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const payload = {};
    try {
      //Append data to payload
      payload.content = this.el.querySelector('textarea').value;
      payload.songId = app.views.song.data.id;

      const _res = await fetch(`${app.URL}/comment`, {
        method: 'POST',
        credentials: 'include', //Include cookie
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if(_res.status !== 200) throw `${_res.status}: ${_res.statusText}`;
      const res = await _res.json();
      if (res.type === 'error') throw res.err;

      //Create new comment data
      const _data = {
        id: 0,
        content: payload.content,
        artist: app.artist
      }

      //Insert new comment into the DOM
      const comment = new Comment(_data);
      this.el.insertBefore(comment.render(), this.el.children[0]);
      this.data.unshift(_data);

      this.el.querySelector('textarea').value = ''; //Reset comment field to empty
    }
    catch (err) {
      log.error(err);
    }
  }

  this.render = () => {
    //Create elements
    const container = document.createElement('form');
    const marker = document.createElement('div');
    const textarea = document.createElement('textarea');
    const submit = document.createElement('button');

    //Add classes for styling
    this.el.className = 'comments';
    container.className = 'comment-container';
    marker.className = 'marker';

    //Add attributes and innerHTML/textContent
    submit.textContent = 'submit';
    submit.setAttribute('type', 'submit');
    textarea.setAttribute('rows', '1');
    textarea.setAttribute('autofocus', true);
    textarea.setAttribute('placeholder', 'send comment..');
    marker.textContent = '> '

    //Build structure
    for (let _comment of this.data) {
      const comment = new Comment(_comment);
      this.el.appendChild(comment.render());
    }

    this.el.appendChild(container);
    container.appendChild(marker);
    container.appendChild(textarea);
    container.appendChild(submit);

    //Add listeners
    container.onsubmit = this.handleSubmit;
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submit.click();
      }
    });

    return this.el;
  }
}

module.exports = Comments;
