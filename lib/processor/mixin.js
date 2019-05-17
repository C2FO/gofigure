

const _ = require('lodash');

const mergeMixin = (originalConfig, env, defaultEnv, nodeType) => {
    const mixin = originalConfig.__mixin__ || {};
    if (!mixin) {
        return originalConfig;
    }
    if (!env) {
        return originalConfig;
    }
    const config = {};
    if (_.has(originalConfig, defaultEnv)) {
        _.set(config, defaultEnv, _.merge({}, mixin, originalConfig[defaultEnv]));
    }
    if (_.has(originalConfig, env)) {
        _.set(config, env, _.merge({}, mixin, originalConfig[env]));
    }
    if (_.has(originalConfig, `type.${env}.${nodeType}`)) {
        const nodeTypeEnvPath = `type.${env}.${nodeType}`;
        const nodeTypeConfig = _.get(originalConfig, `type.${env}.${nodeType}`);
        _.set(config, nodeTypeEnvPath, _.merge({}, mixin, nodeTypeConfig));
    }
    return config;
};

const mixinMerger = (config, opts) => {
    const options = opts || {};
    const defaultEnvironment = options.defaultEnvironment || null;
    const environment = options.environment || null;
    const nodeType = options.nodeType || null;
    return mergeMixin(config, environment, defaultEnvironment, nodeType);
};

module.exports = mixinMerger;
