const _ = require('lodash');
const replacer = require('./replacer');
const merger = require('./merger');
const selector = require('./selector');
const mixin = require('./mixin');

const processConfig = (config, options) => {
  const merged = mixin(config, options);
  const mergeEnvConfig = selector(merged, options);
  return replacer(mergeEnvConfig, options);
};

const processor = (configToMergeInto, sourceConfigs, options) => {
  const mergedSource = sourceConfigs.reduce((merged, source) => _.merge(merged, processConfig(source, options)), {});
  return merger(configToMergeInto, mergedSource, options);
};

module.exports = processor;
