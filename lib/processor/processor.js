const _ = require('lodash');
const replacer = require('./replacer');
const merger = require('./merger');
const selector = require('./selector');
const mixin = require('./mixin');

const processor = (configToMergeInto, sourceConfigs, options) => {
  const mergedSource = sourceConfigs.reduce((merged, source) => _.merge(merged, mixin(source, options)), {});
  const mergeEnvConfig = selector(mergedSource, options);
  const replaced = replacer(mergeEnvConfig, options);
  return merger(configToMergeInto, replaced, options);
};

module.exports = processor;
