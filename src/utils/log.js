const _log = (msg) => {
  console.log(msg);
}
const success = (msg) => {
  console.log(`✅ %c${msg}`, 'color: #00c30f;');
}

const error = (msg) => {
  console.error(msg);
}

const warn = (msg) => {
  console.warn(msg);
}

const log = module.exports = _log
log.success = success;
log.error = error;
log.warn = warn;

