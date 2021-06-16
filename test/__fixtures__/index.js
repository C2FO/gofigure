/* eslint-disable no-template-curly-in-string */

const configs = require('./configs');
const configsWithMixins = require('./configs-with-mixins');
const { setTimeoutPromise, rejectIfError } = require('./helpers');

function writeConfigs(configsToWrite) {
  Object.keys(configsToWrite).forEach((key) => {
    configsToWrite[key].write();
  });
}

function createConfigs() {
  writeConfigs(configs);
  writeConfigs(configsWithMixins);
}

module.exports = {
  createConfigs,
  setTimeoutPromise,
  rejectIfError,
  configs,
  configsWithMixins,
};
