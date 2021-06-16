const fs = require('fs');
const path = require('path');
const _ = require('lodash');

class TestConfig {
  constructor({ config, dir, fileName }) {
    this.config = config;
    this.dir = dir;
    this.path = path.resolve(dir, fileName);
  }

  write() {
    if (fs.existsSync(this.path)) {
      fs.unlinkSync(this.path);
    }
    fs.mkdirSync(this.dir, { recursive: true });
    fs.writeFileSync(this.path, JSON.stringify(this.config, null, 4), { flag: 'w' });
  }

  update(update) {
    fs.writeFileSync(this.path, JSON.stringify(_.merge({}, this.config, update), null, 4));
  }
}

function setTimeoutPromise(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), timeout);
  });
}

function rejectIfError(rej, fn) {
  return function _rejectIfError(...args) {
    try {
      fn(...args);
    } catch (e) {
      rej(e);
    }
  };
}

module.exports = {
  TestConfig,
  setTimeoutPromise,
  rejectIfError,
};
