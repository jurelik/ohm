'use strict';

const wrapper = (msg, type) => {
  const el = document.querySelector('log');
  if (el) el.textContent = msg;

  if (type === 'success') return success(msg);
  else if (type === 'error') return error(msg);
  else if (type === 'warn') return warn(msg);
  else _log(msg);
}

const _log = console.log.bind(window.console, '%c%s', 'margin-top: 5px;');
const success = console.log.bind(window.console, '%c%s', 'color:#00c30f; margin-top: 5px;');
const error = console.error.bind(window.console);
const warn = console.warn.bind(window.console);

const log = module.exports = wrapper;
log.success = (msg) => wrapper(msg, 'success');
log.error = (msg) => wrapper(msg, 'error');
log.warn = (msg) => wrapper(msg, 'warn');

