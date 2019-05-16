'use strict';

const _ = require('lodash');

const mergeConfigs = (configs) => {
    return configs.reduce((config, newC) => _.merge(config, newC), {});
};

module.exports = {
    mergeConfigs,
};
