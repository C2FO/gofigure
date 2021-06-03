process.env.NODE_ENV = '';

const path = require('path');
const _ = require('lodash');

const fixtures = require('./__fixtures__');
const goFigure = require('../lib');

const { conf1, conf2, envConf, sharedEnvConf } = fixtures;

describe('gofigure', () => {
  beforeEach(() => fixtures.createConfigs());

  afterEach(() => fixtures.createConfigs());

  const createUpdatesPromise = (configName, updates) =>
    updates.reduce(
      (p, change) =>
        p.then(() => fixtures.updateConfig(configName, change)).then(() => fixtures.setTimeoutPromise(200)),
      fixtures.setTimeoutPromise(10),
    );

  describe('#load', () => {
    it('load configuration from directories', () => {
      const config1 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs1')] });
      const config2 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs2')] });
      return config1
        .load()
        .then((config) => expect(config).toEqual(conf1))
        .then(() => config2.load())
        .then((config) => expect(config).toEqual(conf2));
    });

    it('load configuration from files', () => {
      const config1 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs1/config1.json')] });
      const config2 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs2/config2.json')] });
      return config1
        .load()
        .then((config) => expect(config).toEqual(conf1))
        .then(() => config2.load())
        .then((config) => expect(config).toEqual(conf2));
    });

    describe('with an env', () => {
      it('from directories', () => {
        const configDev = goFigure({
          environment: 'development',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env')],
        });
        const configProd = goFigure({
          environment: 'production',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env')],
        });
        const configTest = goFigure({
          environment: 'test',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env')],
        });
        return configDev
          .load()
          .then((config) => expect(config).toEqual(envConf.development))
          .then(() => configProd.load())
          .then((config) => expect(config).toEqual(envConf.production))
          .then(() => configTest.load())
          .then((config) => expect(config).toEqual(envConf.test));
      });

      it('from files', () => {
        const configDev = goFigure({
          environment: 'development',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
        });
        const configProd = goFigure({
          environment: 'production',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
        });
        const configTest = goFigure({
          environment: 'test',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
        });
        return configDev
          .load()
          .then((config) => expect(config).toEqual(envConf.development))
          .then(() => configProd.load())
          .then((config) => expect(config).toEqual(envConf.production))
          .then(() => configTest.load())
          .then((config) => expect(config).toEqual(envConf.test));
      });
    });

    describe('with a mixin', () => {
      it('from directories', () => {
        const configDevOne = goFigure({
          environment: 'development-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const devOne = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinDevelopmentOne['development-one'],
          fixtures.developmentMixin.mixin,
        );
        const configDevTwo = goFigure({
          environment: 'development-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const devTwo = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinDevelopmentTwo['development-two'],
          fixtures.developmentMixin.mixin,
        );
        const configProdOne = goFigure({
          environment: 'production-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const prodOne = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinProductionOne['production-one'],
          fixtures.productionMixin.mixin,
        );
        const configProdTwo = goFigure({
          environment: 'production-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const prodTwo = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinProductionTwo['production-two'],
          fixtures.productionMixin.mixin,
        );
        return configDevOne
          .load()
          .then((config) => expect(config).toEqual(devOne))
          .then(() => configDevTwo.load())
          .then((config) => expect(config).toEqual(devTwo))
          .then(() => configProdOne.load())
          .then((config) => expect(config).toEqual(prodOne))
          .then(() => configProdTwo.load())
          .then((config) => expect(config).toEqual(prodTwo));
      });

      it('from files', () => {
        const configDevOne = goFigure({
          environment: 'development-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.development-one.json')],
        });
        const devOne = _.merge(
          {},
          fixtures.configMixinDevelopmentOne['development-one'],
          fixtures.developmentMixin.mixin,
        );
        const configDevTwo = goFigure({
          environment: 'development-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.development-two.json')],
        });
        const devTwo = _.merge(
          {},
          fixtures.configMixinDevelopmentTwo['development-two'],
          fixtures.developmentMixin.mixin,
        );
        const configProdOne = goFigure({
          environment: 'production-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.production-one.json')],
        });
        const prodOne = _.merge(
          {},
          fixtures.configMixinProductionOne['production-one'],
          fixtures.productionMixin.mixin,
        );
        const configProdTwo = goFigure({
          environment: 'production-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.production-two.json')],
        });
        const prodTwo = _.merge(
          {},
          fixtures.configMixinProductionTwo['production-two'],
          fixtures.productionMixin.mixin,
        );
        return configDevOne
          .load()
          .then((config) => expect(config).toEqual(devOne))
          .then(() => configDevTwo.load())
          .then((config) => expect(config).toEqual(devTwo))
          .then(() => configProdOne.load())
          .then((config) => expect(config).toEqual(prodOne))
          .then(() => configProdTwo.load())
          .then((config) => expect(config).toEqual(prodTwo));
      });
    });
  });

  describe('#loadSync', () => {
    it('load configuration from certain directories', () => {
      const config1 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs1')] });
      const config2 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs2')] });
      expect(config1.loadSync()).toEqual(conf1);
      expect(config2.loadSync()).toEqual(conf2);
    });

    it('load configuration from certain files', () => {
      const config1 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs1/config1.json')] });
      const config2 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs2/config2.json')] });
      expect(config1.loadSync()).toEqual(conf1);
      expect(config2.loadSync()).toEqual(conf2);
    });

    it('load should call listeners when setting', () => {
      const config1 = goFigure({ locations: [path.resolve(__dirname, '__fixtures__/configs/configs1/config1.json')] });
      const res = [];
      ['a', 'b', 'b.c', 'b.f', 'e', 'e.f', 'e.g', 'e.g.h'].forEach((topic) => {
        config1.on(topic, (k, v) => {
          res.push([topic, k, v]);
        });
      });
      expect(config1.loadSync()).toEqual(conf1);
      return fixtures.setTimeoutPromise(50).then(() => {
        expect(res).toEqual([
          ['a', 'a', 1],
          ['b', 'b', { c: 1, d: 2 }],
          ['b.c', 'b.c', 1],
          ['e', 'e', { f: 3, g: { h: 4 } }],
          ['e.f', 'e.f', 3],
          ['e.g', 'e.g', { h: 4 }],
          ['e.g.h', 'e.g.h', 4],
        ]);
      });
    });

    describe('with an env', () => {
      it('from directories', () => {
        const configDev = goFigure({
          environment: 'development',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env')],
        });
        const configProd = goFigure({
          environment: 'production',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env')],
        });
        const configTest = goFigure({
          environment: 'test',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env')],
        });
        expect(configDev.loadSync()).toEqual(envConf.development);
        expect(configProd.loadSync()).toEqual(envConf.production);
        expect(configTest.loadSync()).toEqual(envConf.test);
      });

      it('from files', () => {
        const configDev = goFigure({
          environment: 'development',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
        });
        const configProd = goFigure({
          environment: 'production',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
        });
        const configTest = goFigure({
          environment: 'test',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
        });
        expect(configDev.loadSync()).toEqual(envConf.development);
        expect(configProd.loadSync()).toEqual(envConf.production);
        expect(configTest.loadSync()).toEqual(envConf.test);
      });
    });

    describe('with an shared env', () => {
      it('from directories', () => {
        const configDev = goFigure({
          environment: 'development',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-shared-env')],
        });
        const configProd = goFigure({
          environment: 'production',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-shared-env')],
        });
        const configTest = goFigure({
          environment: 'test',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-shared-env')],
        });
        expect(configDev.loadSync()).toEqual(_.merge({}, sharedEnvConf['*'], sharedEnvConf.development));
        expect(configProd.loadSync()).toEqual(_.merge({}, sharedEnvConf['*'], sharedEnvConf.production));
        expect(configTest.loadSync()).toEqual(_.merge({}, sharedEnvConf['*'], sharedEnvConf.test));
      });

      it('from files', () => {
        const configDev = goFigure({
          environment: 'development',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-shared-env/config.json')],
        });
        const configProd = goFigure({
          environment: 'production',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-shared-env/config.json')],
        });
        const configTest = goFigure({
          environment: 'test',
          locations: [path.resolve(__dirname, '__fixtures__/configs/config-shared-env/config.json')],
        });
        expect(configDev.loadSync()).toEqual(_.merge({}, sharedEnvConf['*'], sharedEnvConf.development));
        expect(configProd.loadSync()).toEqual(_.merge({}, sharedEnvConf['*'], sharedEnvConf.production));
        expect(configTest.loadSync()).toEqual(_.merge({}, sharedEnvConf['*'], sharedEnvConf.test));
      });
    });

    describe('with a mixin', () => {
      it('from directories', () => {
        const configDevOne = goFigure({
          environment: 'development-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const devOne = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinDevelopmentOne['development-one'],
          fixtures.developmentMixin.mixin,
        );
        const configDevTwo = goFigure({
          environment: 'development-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const devTwo = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinDevelopmentTwo['development-two'],
          fixtures.developmentMixin.mixin,
        );
        const configProdOne = goFigure({
          environment: 'production-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const prodOne = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinProductionOne['production-one'],
          fixtures.productionMixin.mixin,
        );
        const configProdTwo = goFigure({
          environment: 'production-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin')],
        });
        const prodTwo = _.merge(
          {},
          fixtures.configMixinDefault['*'],
          fixtures.configMixinProductionTwo['production-two'],
          fixtures.productionMixin.mixin,
        );
        expect(configDevOne.loadSync()).toEqual(devOne);
        expect(configDevTwo.loadSync()).toEqual(devTwo);
        expect(configProdOne.loadSync()).toEqual(prodOne);
        expect(configProdTwo.loadSync()).toEqual(prodTwo);
      });

      it('from files', () => {
        const configDevOne = goFigure({
          environment: 'development-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.development-one.json')],
        });
        const devOne = _.merge(
          {},
          fixtures.configMixinDevelopmentOne['development-one'],
          fixtures.developmentMixin.mixin,
        );
        const configDevTwo = goFigure({
          environment: 'development-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.development-two.json')],
        });
        const devTwo = _.merge(
          {},
          fixtures.configMixinDevelopmentTwo['development-two'],
          fixtures.developmentMixin.mixin,
        );
        const configProdOne = goFigure({
          environment: 'production-one',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.production-one.json')],
        });
        const prodOne = _.merge(
          {},
          fixtures.configMixinProductionOne['production-one'],
          fixtures.productionMixin.mixin,
        );
        const configProdTwo = goFigure({
          environment: 'production-two',
          locations: [path.resolve(__dirname, '__fixtures__/config-mixin/config-mixin.production-two.json')],
        });
        const prodTwo = _.merge(
          {},
          fixtures.configMixinProductionTwo['production-two'],
          fixtures.productionMixin.mixin,
        );
        expect(configDevOne.loadSync()).toEqual(devOne);
        expect(configDevTwo.loadSync()).toEqual(devTwo);
        expect(configProdOne.loadSync()).toEqual(prodOne);
        expect(configProdTwo.loadSync()).toEqual(prodTwo);
      });
    });
  });

  describe('#on', () => {
    it('monitor configurations in certain directories', () => {
      const config1 = goFigure({
        monitor: true,
        locations: [path.resolve(__dirname, '__fixtures__/configs/configs1')],
      });
      config1.loadSync();
      const res = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.on(topic, (key, val) => {
          res.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(res).toEqual([
          { key: 'a', val: 4 },
          { key: 'a', val: 1 },
          { key: 'b.c', val: 5 },
          { key: 'b.c', val: 1 },
          { key: 'b.d', val: 7 },
          { key: 'b.d', val: 2 },
          { key: 'e', val: { f: 8, g: { h: 4 } } },
          { key: 'e', val: { f: 3, g: { h: 9 } } },
          { key: 'e.g', val: { h: 9 } },
          { key: 'e.g.h', val: 9 },
        ]);
      });
    });

    it('monitor configurations of files', () => {
      const config1 = goFigure({
        monitor: true,
        locations: [path.resolve(__dirname, '__fixtures__/configs/configs1/config1.json')],
      });
      config1.loadSync();
      const events = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.on(topic, (key, val) => {
          events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(events).toEqual([
          { key: 'a', val: 4 },
          { key: 'a', val: 1 },
          { key: 'b.c', val: 5 },
          { key: 'b.c', val: 1 },
          { key: 'b.d', val: 7 },
          { key: 'b.d', val: 2 },
          { key: 'e', val: { f: 8, g: { h: 4 } } },
          { key: 'e', val: { f: 3, g: { h: 9 } } },
          { key: 'e.g', val: { h: 9 } },
          { key: 'e.g.h', val: 9 },
        ]);
      });
    });

    it('monitor configurations of certain files', () => {
      const config1 = goFigure({
        monitor: false,
        locations: [{ monitor: true, file: path.resolve(__dirname, '__fixtures__/configs/configs1/config1.json') }],
      });
      config1.loadSync();
      const events = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.on(topic, (key, val) => {
          events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [
        _.merge({}, conf1, { a: 4 }),
        _.merge({}, conf1, { b: { c: 5 } }),
        _.merge({}, conf1, { b: { d: 7 } }),
        _.merge({}, conf1, { e: { f: 8 } }),
        _.merge({}, conf1, { e: { g: { h: 9 } } }),
      ];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(events).toEqual([
          { key: 'a', val: 4 },
          { key: 'a', val: 1 },
          { key: 'b.c', val: 5 },
          { key: 'b.c', val: 1 },
          { key: 'b.d', val: 7 },
          { key: 'b.d', val: 2 },
          { key: 'e', val: { f: 8, g: { h: 4 } } },
          { key: 'e', val: { f: 3, g: { h: 9 } } },
          { key: 'e.g', val: { h: 9 } },
          { key: 'e.g.h', val: 9 },
        ]);
      });
    });

    describe('with an env', () => {
      it('monitor configurations of files', () => {
        const events = {};
        const configs = ['development', 'production', 'test'].map((env) => {
          const config = goFigure({
            monitor: true,
            environment: env,
            locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
          });
          config.loadSync();
          events[env] = [];
          ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
            config.on(topic, (key, val) => {
              events[env].push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
            });
          });
          return config;
        });
        const changes = [
          { development: { a: 6 }, production: { a: 11 }, test: { a: 16 } },
          { development: { b: { c: 7 } }, production: { b: { c: 12 } }, test: { b: { c: 17 } } },
          { development: { b: { d: 8 } }, production: { b: { d: 13 } }, test: { b: { d: 18 } } },
          { development: { e: { f: 9 } }, production: { e: { f: 14 } }, test: { e: { f: 19 } } },
          {
            development: { e: { g: { h: 10 } } },
            production: { e: { g: { h: 15 } } },
            test: { e: { g: { h: 20 } } },
          },
        ];
        return createUpdatesPromise('envConf', changes).then(() => {
          configs.forEach((c) => c.stop());
          expect(events).toEqual({
            development: [
              { key: 'a', val: 6 },
              { key: 'a', val: 1 },
              { key: 'b.c', val: 7 },
              { key: 'b.c', val: 2 },
              { key: 'b.d', val: 8 },
              { key: 'b.d', val: 3 },
              { key: 'e', val: { f: 9, g: { h: 5 } } },
              { key: 'e', val: { f: 4, g: { h: 10 } } },
              { key: 'e.g', val: { h: 10 } },
              { key: 'e.g.h', val: 10 },
            ],
            production: [
              { key: 'a', val: 11 },
              { key: 'a', val: 6 },
              { key: 'b.c', val: 12 },
              { key: 'b.c', val: 7 },
              { key: 'b.d', val: 13 },
              { key: 'b.d', val: 8 },
              { key: 'e', val: { f: 14, g: { h: 10 } } },
              { key: 'e', val: { f: 9, g: { h: 15 } } },
              { key: 'e.g', val: { h: 15 } },
              { key: 'e.g.h', val: 15 },
            ],
            test: [
              { key: 'a', val: 16 },
              { key: 'a', val: 11 },
              { key: 'b.c', val: 17 },
              { key: 'b.c', val: 12 },
              { key: 'b.d', val: 18 },
              { key: 'b.d', val: 13 },
              { key: 'e', val: { f: 19, g: { h: 15 } } },
              { key: 'e', val: { f: 14, g: { h: 20 } } },
              { key: 'e.g', val: { h: 20 } },
              { key: 'e.g.h', val: 20 },
            ],
          });
        });
      });
    });
  });

  describe('#addListener', () => {
    it('monitor configurations in certain directories', () => {
      const config1 = goFigure({
        monitor: true,
        locations: [path.resolve(__dirname, '__fixtures__/configs/configs1')],
      });
      config1.loadSync();
      const res = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.addListener(topic, (key, val) => {
          res.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(res).toEqual([
          { key: 'a', val: 4 },
          { key: 'a', val: 1 },
          { key: 'b.c', val: 5 },
          { key: 'b.c', val: 1 },
          { key: 'b.d', val: 7 },
          { key: 'b.d', val: 2 },
          { key: 'e', val: { f: 8, g: { h: 4 } } },
          { key: 'e', val: { f: 3, g: { h: 9 } } },
          { key: 'e.g', val: { h: 9 } },
          { key: 'e.g.h', val: 9 },
        ]);
      });
    });

    it('monitor configurations of files', () => {
      const config1 = goFigure({
        monitor: true,
        locations: [path.resolve(__dirname, '__fixtures__/configs/configs1/config1.json')],
      });
      config1.loadSync();
      const events = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.addListener(topic, (key, val) => {
          events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(events).toEqual([
          { key: 'a', val: 4 },
          { key: 'a', val: 1 },
          { key: 'b.c', val: 5 },
          { key: 'b.c', val: 1 },
          { key: 'b.d', val: 7 },
          { key: 'b.d', val: 2 },
          { key: 'e', val: { f: 8, g: { h: 4 } } },
          { key: 'e', val: { f: 3, g: { h: 9 } } },
          { key: 'e.g', val: { h: 9 } },
          { key: 'e.g.h', val: 9 },
        ]);
      });
    });

    it('monitor configurations of certain files', () => {
      const config1 = goFigure({
        monitor: false,
        locations: [{ monitor: true, file: path.resolve(__dirname, '__fixtures__/configs/configs1/config1.json') }],
      });
      config1.loadSync();
      const events = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.addListener(topic, (key, val) => {
          events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [
        _.merge({}, conf1, { a: 4 }),
        _.merge({}, conf1, { b: { c: 5 } }),
        _.merge({}, conf1, { b: { d: 7 } }),
        _.merge({}, conf1, { e: { f: 8 } }),
        _.merge({}, conf1, { e: { g: { h: 9 } } }),
      ];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(events).toEqual([
          { key: 'a', val: 4 },
          { key: 'a', val: 1 },
          { key: 'b.c', val: 5 },
          { key: 'b.c', val: 1 },
          { key: 'b.d', val: 7 },
          { key: 'b.d', val: 2 },
          { key: 'e', val: { f: 8, g: { h: 4 } } },
          { key: 'e', val: { f: 3, g: { h: 9 } } },
          { key: 'e.g', val: { h: 9 } },
          { key: 'e.g.h', val: 9 },
        ]);
      });
    });

    describe('with an env', () => {
      it('monitor configurations of files', () => {
        const events = {};
        const configs = ['development', 'production', 'test'].map((env) => {
          const config = goFigure({
            monitor: true,
            environment: env,
            locations: [path.resolve(__dirname, '__fixtures__/configs/config-env/config.json')],
          });
          config.loadSync();
          events[env] = [];
          ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
            config.addListener(topic, (key, val) => {
              events[env].push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
            });
          });
          return config;
        });
        const changes = [
          { development: { a: 6 }, production: { a: 11 }, test: { a: 16 } },
          { development: { b: { c: 7 } }, production: { b: { c: 12 } }, test: { b: { c: 17 } } },
          { development: { b: { d: 8 } }, production: { b: { d: 13 } }, test: { b: { d: 18 } } },
          { development: { e: { f: 9 } }, production: { e: { f: 14 } }, test: { e: { f: 19 } } },
          {
            development: { e: { g: { h: 10 } } },
            production: { e: { g: { h: 15 } } },
            test: { e: { g: { h: 20 } } },
          },
        ];
        return createUpdatesPromise('envConf', changes).then(() => {
          configs.forEach((c) => c.stop());
          expect(events).toEqual({
            development: [
              { key: 'a', val: 6 },
              { key: 'a', val: 1 },
              { key: 'b.c', val: 7 },
              { key: 'b.c', val: 2 },
              { key: 'b.d', val: 8 },
              { key: 'b.d', val: 3 },
              { key: 'e', val: { f: 9, g: { h: 5 } } },
              { key: 'e', val: { f: 4, g: { h: 10 } } },
              { key: 'e.g', val: { h: 10 } },
              { key: 'e.g.h', val: 10 },
            ],
            production: [
              { key: 'a', val: 11 },
              { key: 'a', val: 6 },
              { key: 'b.c', val: 12 },
              { key: 'b.c', val: 7 },
              { key: 'b.d', val: 13 },
              { key: 'b.d', val: 8 },
              { key: 'e', val: { f: 14, g: { h: 10 } } },
              { key: 'e', val: { f: 9, g: { h: 15 } } },
              { key: 'e.g', val: { h: 15 } },
              { key: 'e.g.h', val: 15 },
            ],
            test: [
              { key: 'a', val: 16 },
              { key: 'a', val: 11 },
              { key: 'b.c', val: 17 },
              { key: 'b.c', val: 12 },
              { key: 'b.d', val: 18 },
              { key: 'b.d', val: 13 },
              { key: 'e', val: { f: 19, g: { h: 15 } } },
              { key: 'e', val: { f: 14, g: { h: 20 } } },
              { key: 'e.g', val: { h: 20 } },
              { key: 'e.g.h', val: 20 },
            ],
          });
        });
      });
    });
  });

  describe('#once', () => {
    it('should stop listening', () => {
      const config1 = goFigure({
        monitor: true,
        locations: [path.resolve(__dirname, '__fixtures__/configs/configs1')],
      });
      config1.loadSync();
      const events = [];
      config1.once('a', (key, val) => events.push({ key, val, type: 'once' }));
      config1.on('a', (key, val) => events.push({ key, val, type: 'on' }));

      const changes = [{ a: 4 }, { a: 1 }];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(events).toEqual([
          { key: 'a', val: 4, type: 'once' },
          { key: 'a', val: 4, type: 'on' },
          { key: 'a', val: 1, type: 'on' },
        ]);
      });
    });
  });

  describe('#removeListener', () => {
    it('should stop listening', () => {
      const config1 = goFigure({
        monitor: true,
        locations: [path.resolve(__dirname, '__fixtures__/configs/configs1')],
      });
      config1.loadSync();
      const events = [];
      const onAndRemove = (key, val) => {
        events.push({ key, val, type: 'onAndRemove' });
        config1.removeListener('a', onAndRemove);
      };
      config1.on('a', onAndRemove);
      config1.on('a', (key, val) => events.push({ key, val, type: 'on' }));

      const changes = [{ a: 4 }, { a: 1 }];
      return createUpdatesPromise('conf1', changes).then(() => {
        config1.stop();
        expect(events).toEqual([
          { key: 'a', val: 4, type: 'onAndRemove' },
          { key: 'a', val: 4, type: 'on' },
          { key: 'a', val: 1, type: 'on' },
        ]);
      });
    });
  });
});
