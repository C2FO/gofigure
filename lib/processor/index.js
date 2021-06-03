const _ = require('lodash');
const selector = require('./selector');
const merger = require('./merger');
const mixin = require('./mixin');
const replacer = require('./replacer');

module.exports = (configToMergeInto, sourceConfigs, options) => {
    const mergedSource = sourceConfigs.reduce((merged, source) => _.merge(merged, mixin(source, options)), {});
    const mergeEnvConfig = selector(mergedSource, options);
    const replaced = replacer(mergeEnvConfig, options);
    return merger(configToMergeInto, replaced, options);
};
