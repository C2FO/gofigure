const _ = require('lodash');

const mergeConfigs = (configs) => configs.reduce((config, newC) => _.merge(config, newC), {});

module.exports = {
  mergeConfigs,
};
