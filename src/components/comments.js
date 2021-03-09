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

      //Insert new comment into the DOM
      payload.artist = 'antik'; //For testing purposes
      const comment = new Comment(payload);
      this.el.insertBefore(comment.render(), this.el.children[0]);
    }
    catch (err) {
      console.error(err);
    }
  }

  this.render = () => {
    //Create elements
    const container = document.createElement('div');
    const marker = document.createElement('div');
    const textarea = document.createElement('textarea');
    const submit = document.createElement('button');

    //Add classes for styling
    this.el.className = 'comments';
    container.className = 'comment-container';
    marker.className = 'marker';

    //Add attributes and innerHTML
    submit.innerHTML = 'submit';
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
    submit.onclick = this.handleSubmit;

    return this.el;
  }
}

module.exports = Comments;
