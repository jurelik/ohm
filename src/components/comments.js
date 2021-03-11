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
      payload.songId = app.views.songView.data.id;

      const _res = await fetch(`${app.URL}/api/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const res = await _res.json();
      if (res.type === 'error') throw res.err;

      //Create new comment data
      const _data = {
        id: 0,
        content: payload.content,
        artist: 'antik' //For testing purposes
      }

      //Insert new comment into the DOM
      const comment = new Comment(_data);
      this.el.insertBefore(comment.render(), this.el.children[0]);
      this.data.unshift(_data);

      this.el.querySelector('textarea').value = ''; //Reset comment field to empty
    }
    catch (err) {
      console.error(err);
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

    //Add attributes and innerHTML
    submit.innerHTML = 'submit';
    submit.setAttribute('type', 'submit');
    textarea.setAttribute('rows', '1');
    textarea.setAttribute('autofocus', true);
    marker.innerHTML = '> '

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

    return this.el;
  }
}

module.exports = Comments;
