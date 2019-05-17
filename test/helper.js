/* eslint-disable no-template-curly-in-string */


const fs = require('fs');
const path = require('path');
const _ = require('lodash');


const conf1 = {
    a: 1,
    b: {
        c: 1,
        d: 2,
    },
    e: {
        f: 3,
        g: {
            h: 4,
        },
    },
};

const conf2 = {
    b: {
        c: 2,
    },
    i: {
        j: 5,
        k: 6,
    },
    l: 7,
};

const envConf = {
    development: {
        a: 1,
        b: {
            c: 2,
            d: 3,
        },
        e: {
            f: 4,
            g: {
                h: 5,
            },
        },
    },
    production: {
        a: 6,
        b: {
            c: 7,
            d: 8,
        },
        e: {
            f: 9,
            g: {
                h: 10,
            },
        },
    },
    test: {
        a: 11,
        b: {
            c: 12,
            d: 13,
        },
        e: {
            f: 14,
            g: {
                h: 15,
            },
        },
    },
};

const envVarConf = {
    a: '${ENV_A}',
    b: {
        c: '${ENV_B_C}',
        d: '${ENV_B_D}',
    },
    e: {
        f: '${ENV_E_F}',
        g: {
            h: '${ENV_E_G_H}',
        },
    },
};

const sharedEnvConf = {

    '*': {
        a: 1,
        b: 2,
    },
    development: {
        b: 3,
        c: 4,
    },
    test: {
        b: 4,
    },
    production: {
        c: 4,
    },
};

const configMixinDefault = {
    '*': {
        configValueOne: 1,
        configValueTwo: 2,
        envType: 'default',
    },
};

const configMixinProductionOne = {
    mixins: [
        './production.mixin.json',
    ],
    'production-one': {
        'production-env-name': 'production-one',
    },
};

const configMixinProductionTwo = {
    mixins: [
        './production.mixin.json',
    ],
    'production-two': {
        'production-env-name': 'production-two',
    },
};

const productionMixin = {
    mixin: {
        envType: 'production-mixin',
    },
};

const configMixinDevelopmentOne = {
    mixins: [
        './development.mixin.json',
    ],
    'development-one': {
        'development-env-name': 'development-one',
    },
};

const configMixinDevelopmentTwo = {
    mixins: [
        './development.mixin.json',
    ],
    'development-two': {
        'development-env-name': 'development-two',
    },
};

const developmentMixin = {
    mixin: {
        envType: 'development-mixin',
    },
};


const configs = {
    envConf: { config: envConf, file: path.resolve(__dirname, 'configs/config-env/config.json') },
    envVarConf: { config: envVarConf, file: path.resolve(__dirname, 'configs/config-env-var/config.json') },
    sharedEnvConf: { config: sharedEnvConf, file: path.resolve(__dirname, 'configs/config-shared-env/config.json') },
    conf1: { config: conf1, file: path.resolve(__dirname, 'configs/configs1/config1.json') },
    conf2: { config: conf2, file: path.resolve(__dirname, 'configs/configs2/config2.json') },
};

const configsWithMixins = {
    configMixinDefault: { config: configMixinDefault, file: path.resolve(__dirname, 'config-mixin/config-mixin.default.json') },
    configMixinProductionOne: { config: configMixinProductionOne, file: path.resolve(__dirname, 'config-mixin/config-mixin.production-one.json') },
    configMixinProductionTwo: { config: configMixinProductionTwo, file: path.resolve(__dirname, 'config-mixin/config-mixin.production-two.json') },
    productionMixin: { config: productionMixin, file: path.resolve(__dirname, 'config-mixin/production.mixin.json') },
    configMixinDevelopmentOne: { config: configMixinDevelopmentOne, file: path.resolve(__dirname, 'config-mixin/config-mixin.development-one.json') },
    configMixinDevelopmentTwo: { config: configMixinDevelopmentTwo, file: path.resolve(__dirname, 'config-mixin/config-mixin.development-two.json') },
    developmentMixin: { config: developmentMixin, file: path.resolve(__dirname, 'config-mixin/development.mixin.json') },
};

function writeConfigs(configsToWrite) {
    Object.keys(configsToWrite).forEach((key) => {
        const config = configsToWrite[key];
        fs.unlinkSync(config.file);
        fs.writeFileSync(config.file, JSON.stringify(config.config, null, 4));
    });
}

function createConfigs() {
    writeConfigs(configs);
    writeConfigs(configsWithMixins);
}

function updateConfig(config, update) {
    const currConfig = configs[config] || configsWithMixins[config];
    if (currConfig) {
        fs.writeFileSync(
            currConfig.file,
            JSON.stringify(_.merge({}, currConfig.config, update), null, 4)
        );
    } else {
        throw new Error(`Invalid config ${config}`);
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
    updateConfig,
    createConfigs,
    setTimeoutPromise,
    rejectIfError,
    conf1,
    conf2,
    envConf,
    envVarConf,
    sharedEnvConf,
    configMixinDefault,
    configMixinProductionOne,
    configMixinProductionTwo,
    productionMixin,
    configMixinDevelopmentOne,
    configMixinDevelopmentTwo,
    developmentMixin,
};
