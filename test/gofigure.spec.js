process.env.NODE_ENV = '';

const _ = require('lodash');
const {
  createConfigs,
  setTimeoutPromise,
  configs: { conf1, conf2, envConf, sharedEnvConf },
  configsWithMixins: {
    configMixinDefault,
    configMixinDevelopmentOne,
    configMixinDevelopmentTwo,
    configMixinProductionOne,
    configMixinProductionTwo,
    developmentMixin,
    productionMixin,
  },
} = require('./__fixtures__');
const goFigure = require('../lib');

describe('gofigure', () => {
  beforeEach(() => createConfigs());

  afterEach(() => createConfigs());

  const createUpdatesPromise = (config, updates) =>
    updates.reduce(async (p, change) => {
      await p;
      await config.update(change);
      return setTimeoutPromise(200);
    }, setTimeoutPromise(10));

  describe('#load', () => {
    it('load configuration from directories', async () => {
      const config1 = goFigure({ locations: [conf1.dir] });
      const config2 = goFigure({ locations: [conf2.dir] });
      await expect(config1.load()).resolves.toEqual(conf1.config);
      await expect(config2.load()).resolves.toEqual(conf2.config);
    });

    it('load configuration from multiple directories', async () => {
      const config1 = goFigure({ locations: [conf1.dir, conf2.dir] });
      await expect(config1.load()).resolves.toEqual(_.merge({}, conf2.config, conf1.config));
    });

    it('load configuration from files', async () => {
      const config1 = goFigure({ locations: [conf1.path] });
      const config2 = goFigure({ locations: [conf2.path] });

      await expect(config1.load()).resolves.toEqual(conf1.config);
      await expect(config2.load()).resolves.toEqual(conf2.config);
    });

    describe('with an env', () => {
      it('from directories', async () => {
        const configDev = goFigure({ environment: 'development', locations: [envConf.dir] });
        const configProd = goFigure({ environment: 'production', locations: [envConf.dir] });
        const configTest = goFigure({ environment: 'test', locations: [envConf.dir] });

        await expect(configDev.load()).resolves.toEqual(envConf.config.development);
        await expect(configProd.load()).resolves.toEqual(envConf.config.production);
        await expect(configTest.load()).resolves.toEqual(envConf.config.test);
      });

      describe('from multiple directories', () => {
        it('should merged configs with the specified priority', async () => {
          const locations = [envConf.dir, sharedEnvConf.dir];
          const sharedDevEnv = _.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.development);
          const sharedProdEnv = _.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.production);
          const sharedTestEnv = _.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.test);

          const configDev = await goFigure({ environment: 'development', locations }).load();
          expect(configDev).toEqual(_.merge({}, sharedDevEnv, envConf.config.development));

          const configProd = await goFigure({ environment: 'production', locations }).load();
          expect(configProd).toEqual(_.merge({}, sharedProdEnv, envConf.config.production));

          const configTest = await goFigure({ environment: 'test', locations }).load();
          expect(configTest).toEqual(_.merge({}, sharedTestEnv, envConf.config.test));

          const locations2 = [...locations].reverse();
          const configDev2 = await goFigure({ environment: 'development', locations: locations2 }).load();
          expect(configDev2).toEqual(_.merge({}, envConf.config.development, sharedDevEnv));

          const configProd2 = await goFigure({ environment: 'production', locations: locations2 }).load();
          expect(configProd2).toEqual(_.merge({}, envConf.config.production, sharedProdEnv));

          const configTest2 = await goFigure({ environment: 'test', locations: locations2 }).load();
          expect(configTest2).toEqual(_.merge({}, envConf.config.test, sharedTestEnv));
        });
      });

      it('from files', async () => {
        const configDev = goFigure({ environment: 'development', locations: [envConf.path] });
        await expect(configDev.load()).resolves.toEqual(envConf.config.development);

        const configProd = goFigure({ environment: 'production', locations: [envConf.path] });
        await expect(configProd.load()).resolves.toEqual(envConf.config.production);

        const configTest = goFigure({ environment: 'test', locations: [envConf.path] });
        await expect(configTest.load()).resolves.toEqual(envConf.config.test);
      });
    });

    describe('with a mixin', () => {
      it('from directories', async () => {
        const configDevOne = goFigure({ environment: 'development-one', locations: [configMixinDevelopmentOne.dir] });
        const devOne = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinDevelopmentOne.config['development-one'],
          developmentMixin.config.mixin,
        );
        await expect(configDevOne.load()).resolves.toEqual(devOne);

        const configDevTwo = goFigure({ environment: 'development-two', locations: [configMixinDevelopmentTwo.dir] });
        const devTwo = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinDevelopmentTwo.config['development-two'],
          developmentMixin.config.mixin,
        );
        await expect(configDevTwo.load()).resolves.toEqual(devTwo);

        const configProdOne = goFigure({ environment: 'production-one', locations: [configMixinProductionOne.dir] });
        const prodOne = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinProductionOne.config['production-one'],
          productionMixin.config.mixin,
        );
        await expect(configProdOne.load()).resolves.toEqual(prodOne);

        const configProdTwo = goFigure({ environment: 'production-two', locations: [configMixinProductionTwo.dir] });
        const prodTwo = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinProductionTwo.config['production-two'],
          productionMixin.config.mixin,
        );
        await expect(configProdTwo.load()).resolves.toEqual(prodTwo);
      });

      it('from files', async () => {
        const configDevOne = goFigure({ environment: 'development-one', locations: [configMixinDevelopmentOne.path] });
        const devOne = _.merge({}, configMixinDevelopmentOne.config['development-one'], developmentMixin.config.mixin);
        await expect(configDevOne.load()).resolves.toEqual(devOne);

        const configDevTwo = goFigure({ environment: 'development-two', locations: [configMixinDevelopmentTwo.path] });
        const devTwo = _.merge({}, configMixinDevelopmentTwo.config['development-two'], developmentMixin.config.mixin);
        await expect(configDevTwo.load()).resolves.toEqual(devTwo);

        const configProdOne = goFigure({ environment: 'production-one', locations: [configMixinProductionOne.path] });
        const prodOne = _.merge({}, configMixinProductionOne.config['production-one'], productionMixin.config.mixin);
        await expect(configProdOne.load()).resolves.toEqual(prodOne);

        const configProdTwo = goFigure({ environment: 'production-two', locations: [configMixinProductionTwo.path] });
        const prodTwo = _.merge({}, configMixinProductionTwo.config['production-two'], productionMixin.config.mixin);
        await expect(configProdTwo.load()).resolves.toEqual(prodTwo);
      });
    });
  });

  describe('#loadSync', () => {
    it('load configuration from certain directories', () => {
      const config1 = goFigure({ locations: [conf1.dir] });
      expect(config1.loadSync()).toEqual(conf1.config);
      const config2 = goFigure({ locations: [conf2.dir] });
      expect(config2.loadSync()).toEqual(conf2.config);
    });

    it('load configuration from certain files', () => {
      const config1 = goFigure({ locations: [conf1.path] });
      expect(config1.loadSync()).toEqual(conf1.config);
      const config2 = goFigure({ locations: [conf2.path] });
      expect(config2.loadSync()).toEqual(conf2.config);
    });

    it('load should call listeners when setting', async () => {
      const config1 = goFigure({ locations: [conf1.path] });
      const res = [];
      ['a', 'b', 'b.c', 'b.f', 'e', 'e.f', 'e.g', 'e.g.h'].forEach((topic) => {
        config1.on(topic, (k, v) => {
          res.push([topic, k, v]);
        });
      });
      expect(config1.loadSync()).toEqual(conf1.config);
      await setTimeoutPromise(50);
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

    describe('with an env', () => {
      it('from directories', () => {
        const configDev = goFigure({ environment: 'development', locations: [envConf.dir] });
        expect(configDev.loadSync()).toEqual(envConf.config.development);

        const configProd = goFigure({ environment: 'production', locations: [envConf.dir] });
        expect(configProd.loadSync()).toEqual(envConf.config.production);

        const configTest = goFigure({ environment: 'test', locations: [envConf.dir] });
        expect(configTest.loadSync()).toEqual(envConf.config.test);
      });

      it('from files', () => {
        const configDev = goFigure({ environment: 'development', locations: [envConf.path] });
        expect(configDev.loadSync()).toEqual(envConf.config.development);

        const configProd = goFigure({ environment: 'production', locations: [envConf.path] });
        expect(configProd.loadSync()).toEqual(envConf.config.production);

        const configTest = goFigure({ environment: 'test', locations: [envConf.path] });
        expect(configTest.loadSync()).toEqual(envConf.config.test);
      });
    });

    describe('with an shared env', () => {
      it('from directories', () => {
        const configDev = goFigure({ environment: 'development', locations: [sharedEnvConf.dir] });
        expect(configDev.loadSync()).toEqual(_.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.development));

        const configProd = goFigure({ environment: 'production', locations: [sharedEnvConf.dir] });
        expect(configProd.loadSync()).toEqual(_.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.production));

        const configTest = goFigure({ environment: 'test', locations: [sharedEnvConf.dir] });
        expect(configTest.loadSync()).toEqual(_.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.test));
      });

      it('from files', () => {
        const configDev = goFigure({ environment: 'development', locations: [sharedEnvConf.path] });
        expect(configDev.loadSync()).toEqual(_.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.development));

        const configProd = goFigure({ environment: 'production', locations: [sharedEnvConf.path] });
        expect(configProd.loadSync()).toEqual(_.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.production));

        const configTest = goFigure({ environment: 'test', locations: [sharedEnvConf.path] });
        expect(configTest.loadSync()).toEqual(_.merge({}, sharedEnvConf.config['*'], sharedEnvConf.config.test));
      });
    });

    describe('with a mixin', () => {
      it('from directories', () => {
        const configDevOne = goFigure({ environment: 'development-one', locations: [configMixinDevelopmentOne.dir] });
        const devOne = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinDevelopmentOne.config['development-one'],
          developmentMixin.config.mixin,
        );
        expect(configDevOne.loadSync()).toEqual(devOne);

        const configDevTwo = goFigure({ environment: 'development-two', locations: [configMixinDevelopmentOne.dir] });
        const devTwo = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinDevelopmentTwo.config['development-two'],
          developmentMixin.config.mixin,
        );
        expect(configDevTwo.loadSync()).toEqual(devTwo);

        const configProdOne = goFigure({ environment: 'production-one', locations: [configMixinProductionOne.dir] });
        const prodOne = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinProductionOne.config['production-one'],
          productionMixin.config.mixin,
        );
        expect(configProdOne.loadSync()).toEqual(prodOne);

        const configProdTwo = goFigure({ environment: 'production-two', locations: [configMixinProductionTwo.dir] });
        const prodTwo = _.merge(
          {},
          configMixinDefault.config['*'],
          configMixinProductionTwo.config['production-two'],
          productionMixin.config.mixin,
        );
        expect(configProdTwo.loadSync()).toEqual(prodTwo);
      });

      it('from files', () => {
        const configDevOne = goFigure({ environment: 'development-one', locations: [configMixinDevelopmentOne.path] });
        const devOne = _.merge({}, configMixinDevelopmentOne.config['development-one'], developmentMixin.config.mixin);
        expect(configDevOne.loadSync()).toEqual(devOne);

        const configDevTwo = goFigure({ environment: 'development-two', locations: [configMixinDevelopmentTwo.path] });
        const devTwo = _.merge({}, configMixinDevelopmentTwo.config['development-two'], developmentMixin.config.mixin);
        expect(configDevTwo.loadSync()).toEqual(devTwo);

        const configProdOne = goFigure({ environment: 'production-one', locations: [configMixinProductionOne.path] });
        const prodOne = _.merge({}, configMixinProductionOne.config['production-one'], productionMixin.config.mixin);
        expect(configProdOne.loadSync()).toEqual(prodOne);

        const configProdTwo = goFigure({ environment: 'production-two', locations: [configMixinProductionTwo.path] });
        const prodTwo = _.merge({}, configMixinProductionTwo.config['production-two'], productionMixin.config.mixin);
        expect(configProdTwo.loadSync()).toEqual(prodTwo);
      });
    });
  });

  describe('#on', () => {
    it('monitor configurations in certain directories', async () => {
      const config1 = goFigure({ monitor: true, locations: [conf1.dir] });
      config1.loadSync();
      const res = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.on(topic, (key, val) => {
          res.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      await createUpdatesPromise(conf1, changes);
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

    it('monitor configurations of files', async () => {
      const config1 = goFigure({ monitor: true, locations: [conf1.path] });
      config1.loadSync();
      const events = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.on(topic, (key, val) => {
          events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      await createUpdatesPromise(conf1, changes);
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

    it('monitor configurations of certain files', async () => {
      const config1 = goFigure({ monitor: false, locations: [{ monitor: true, file: conf1.path }] });
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
      await createUpdatesPromise(conf1, changes);
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

    describe('with an env', () => {
      it('monitor configurations of files', async () => {
        const events = {};
        const configs = ['development', 'production', 'test'].map((env) => {
          const config = goFigure({ monitor: true, environment: env, locations: [envConf.path] });
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
        await createUpdatesPromise(envConf, changes);
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

  describe('#addListener', () => {
    it('monitor configurations in certain directories', async () => {
      const config1 = goFigure({ monitor: true, locations: [conf1.dir] });
      config1.loadSync();
      const res = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.addListener(topic, (key, val) => {
          res.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      await createUpdatesPromise(conf1, changes);
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

    it('monitor configurations of files', async () => {
      const config1 = goFigure({ monitor: true, locations: [conf1.path] });
      config1.loadSync();
      const events = [];
      ['a', 'b.{c|d}', 'e', 'e.g', 'e.g.*'].forEach((topic) => {
        config1.addListener(topic, (key, val) => {
          events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
        });
      });
      const changes = [{ a: 4 }, { b: { c: 5 } }, { b: { d: 7 } }, { e: { f: 8 } }, { e: { g: { h: 9 } } }];
      await createUpdatesPromise(conf1, changes);
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

    it('monitor configurations of certain files', async () => {
      const config1 = goFigure({ monitor: false, locations: [{ monitor: true, file: conf1.path }] });
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
      await createUpdatesPromise(conf1, changes);
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

    describe('with an env', () => {
      it('monitor configurations of files', async () => {
        const events = {};
        const configs = ['development', 'production', 'test'].map((env) => {
          const config = goFigure({ monitor: true, environment: env, locations: [envConf.path] });
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
        await createUpdatesPromise(envConf, changes);
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

  describe('#once', () => {
    it('should stop listening', async () => {
      const config1 = goFigure({ monitor: true, locations: [conf1.dir] });
      config1.loadSync();
      const events = [];
      config1.once('a', (key, val) => events.push({ key, val, type: 'once' }));
      config1.on('a', (key, val) => events.push({ key, val, type: 'on' }));

      const changes = [{ a: 4 }, { a: 1 }];
      await createUpdatesPromise(conf1, changes);
      config1.stop();
      expect(events).toEqual([
        { key: 'a', val: 4, type: 'once' },
        { key: 'a', val: 4, type: 'on' },
        { key: 'a', val: 1, type: 'on' },
      ]);
    });
  });

  describe('#removeListener', () => {
    it('should stop listening', async () => {
      const config1 = goFigure({ monitor: true, locations: [conf1.dir] });
      config1.loadSync();
      const events = [];
      const onAndRemove = (key, val) => {
        events.push({ key, val, type: 'onAndRemove' });
        config1.removeListener('a', onAndRemove);
      };
      config1.on('a', onAndRemove);
      config1.on('a', (key, val) => events.push({ key, val, type: 'on' }));

      const changes = [{ a: 4 }, { a: 1 }];
      await createUpdatesPromise(conf1, changes);
      config1.stop();
      expect(events).toEqual([
        { key: 'a', val: 4, type: 'onAndRemove' },
        { key: 'a', val: 4, type: 'on' },
        { key: 'a', val: 1, type: 'on' },
      ]);
    });
  });
});
