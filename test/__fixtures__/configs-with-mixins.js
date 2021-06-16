const path = require('path');
const { TestConfig } = require('./helpers');

const configMixinDefault = {
  '*': {
    configValueOne: 1,
    configValueTwo: 2,
    envType: 'default',
  },
};

const configMixinProductionOne = {
  mixins: ['./production.mixin.json'],
  'production-one': {
    'production-env-name': 'production-one',
  },
};

const configMixinProductionTwo = {
  mixins: ['./production.mixin.json'],
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
  mixins: ['./development.mixin.json'],
  'development-one': {
    'development-env-name': 'development-one',
  },
};

const configMixinDevelopmentTwo = {
  mixins: ['./development.mixin.json'],
  'development-two': {
    'development-env-name': 'development-two',
  },
};

const developmentMixin = {
  mixin: {
    envType: 'development-mixin',
  },
};

const CONFIGS_WITH_MIXINS_DIR = path.resolve(__dirname, 'generated', 'config-mixin');

const configsWithMixins = {
  configMixinDefault: new TestConfig({
    config: configMixinDefault,
    dir: CONFIGS_WITH_MIXINS_DIR,
    fileName: 'config-mixin.default.json',
  }),
  configMixinProductionOne: new TestConfig({
    config: configMixinProductionOne,
    dir: CONFIGS_WITH_MIXINS_DIR,
    fileName: 'config-mixin.production-one.json',
  }),
  configMixinProductionTwo: new TestConfig({
    config: configMixinProductionTwo,
    dir: CONFIGS_WITH_MIXINS_DIR,
    fileName: 'config-mixin.production-two.json',
  }),
  productionMixin: new TestConfig({
    config: productionMixin,
    dir: CONFIGS_WITH_MIXINS_DIR,
    fileName: 'production.mixin.json',
  }),
  configMixinDevelopmentOne: new TestConfig({
    config: configMixinDevelopmentOne,
    dir: CONFIGS_WITH_MIXINS_DIR,
    fileName: 'config-mixin.development-one.json',
  }),
  configMixinDevelopmentTwo: new TestConfig({
    config: configMixinDevelopmentTwo,
    dir: CONFIGS_WITH_MIXINS_DIR,
    fileName: 'config-mixin.development-two.json',
  }),
  developmentMixin: new TestConfig({
    config: developmentMixin,
    dir: CONFIGS_WITH_MIXINS_DIR,
    fileName: 'development.mixin.json',
  }),
};

module.exports = configsWithMixins;
