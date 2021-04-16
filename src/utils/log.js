const _log = console.log.bind(window.console, '%c%s', 'margin-top: 5px;');
const success = console.log.bind(window.console, '✅ %c%s', 'color:#00c30f; margin-top: 5px;');
const error = console.error.bind(window.console);
const warn = console.warn.bind(window.console);

const log = module.exports = _log
log.success = success;
log.error = error;
log.warn = warn;

