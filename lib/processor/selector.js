

const _ = require('lodash');

// eslint-disable-next-line consistent-return
const customizer = (objValue, sourceValue) => {
    if (Array.isArray(objValue)) {
        return sourceValue;
    }
};

const selectConfig = (originalConfig, env, defaultEnv, nodeType) => {
    if (!env) {
        return originalConfig;
    }
    const config = {};
    if (_.has(originalConfig, defaultEnv) || _.has(originalConfig, env)) {
        if (defaultEnv && _.has(originalConfig, defaultEnv)) {
            _.merge(config, originalConfig[defaultEnv]);
        }
        if (env && _.has(originalConfig, env)) {
            _.merge(config, originalConfig[env], customizer);
        }
        if (_.has(originalConfig, `type.${env}.${nodeType}`)) {
            _.merge(config, _.get(originalConfig, `type.${env}.${nodeType}`), customizer);
        }
    }
    return config;
};

const configSelector = (config, opts) => {
    const options = opts || {};
    const defaultEnvironment = options.defaultEnvironment || null;
    const environment = options.environment || null;
    const nodeType = options.nodeType || null;
    return selectConfig(config, environment, defaultEnvironment, nodeType);
};

module.exports = configSelector;
