/* eslint-disable no-template-curly-in-string */
const path = require('path');
const { TestConfig } = require('./helpers');

const CONFIGS_DIR = path.resolve(__dirname, 'generated', 'configs');

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

const configs = {
  envConf: new TestConfig({ config: envConf, dir: path.resolve(CONFIGS_DIR, 'config-env'), fileName: 'config.json' }),
  envVarConf: new TestConfig({
    config: envVarConf,
    dir: path.resolve(CONFIGS_DIR, 'config-env-var'),
    fileName: 'config.json',
  }),
  sharedEnvConf: new TestConfig({
    config: sharedEnvConf,
    dir: path.resolve(CONFIGS_DIR, 'config-shared-env'),
    fileName: 'config.json',
  }),
  conf1: new TestConfig({ config: conf1, dir: path.resolve(CONFIGS_DIR, 'configs1'), fileName: 'config1.json' }),
  conf2: new TestConfig({ config: conf2, dir: path.resolve(CONFIGS_DIR, 'configs2'), fileName: 'config2.json' }),
};

module.exports = configs;
