process.env.NODE_ENV = '';
const _ = require('lodash');
const {
  createConfigs,
  rejectIfError,
  setTimeoutPromise,
  configs: { conf1 },
  configsWithMixins: { configMixinProductionOne, productionMixin },
} = require('../__fixtures__');
const FileLoader = require('../../lib/loader/FileLoader');

describe('FileLoader', () => {
  it('accept and set a file', () => {
    const loader = new FileLoader({ file: conf1.path });
    expect(loader.file).toBe(conf1.path);
  });

  beforeEach(() => createConfigs());

  afterEach(() => createConfigs());

  describe('#loadSync', () => {
    it('load a file', () => {
      const loader = new FileLoader({ file: conf1.path });
      expect(loader.loadSync()).toEqual(conf1.config);
      expect(loader.config).toEqual(conf1.config);
    });

    describe('with mixins', () => {
      it('should load a file and merge in mixins', async () => {
        const loader = new FileLoader({ file: configMixinProductionOne.path });
        const expectedConfig = _.merge({}, configMixinProductionOne.config, {
          __mixin__: productionMixin.config.mixin,
        });
        const config = await loader.load();
        expect(config).toEqual(expectedConfig);
        expect(loader.config).toEqual(expectedConfig);
      });
    });
  });

  describe('#load', () => {
    it('load a file asynchronously', async () => {
      const loader = new FileLoader({ file: conf1.path });
      const conf = await loader.load();
      expect(conf).toEqual(conf1.config);
      expect(loader.config).toEqual(conf1.config);
    });

    describe('with mixins', () => {
      it('should load a file and merge in mixins', async () => {
        const loader = new FileLoader({ file: configMixinProductionOne.path });
        const expectedConfig = _.merge({}, configMixinProductionOne.config, {
          __mixin__: productionMixin.config.mixin,
        });
        const config = await loader.load();
        expect(config).toEqual(expectedConfig);
        expect(loader.config).toEqual(expectedConfig);
      });
    });
  });

  describe('#watch', () => {
    it('watch a file for changes sync', () => {
      const loader = new FileLoader({ file: conf1.path });
      expect(loader.loadSync()).toEqual(conf1.config);

      return new Promise((res, rej) => {
        loader.watch().on(
          'change',
          rejectIfError(rej, (name, conf) => {
            expect(name).toBe('change');
            expect(conf).toEqual(_.merge({}, conf1.config, { a: 2 }));
            loader.unWatch();
            res();
          }),
        );
        return setTimeoutPromise(10)
          .then(() => conf1.update({ a: 2 }))
          .catch(rej);
      });
    });

    it('watch a file for changes async', () => {
      const loader = new FileLoader({ file: conf1.path });
      return loader.load().then((config) => {
        expect(config).toEqual(conf1.config);

        return new Promise((res, rej) => {
          loader.watch().on(
            'change',
            rejectIfError(rej, (name, conf) => {
              expect(name).toBe('change');
              expect(conf).toEqual(_.merge({}, conf1.config, { a: 2 }));
              loader.unWatch();
              res();
            }),
          );
          return setTimeoutPromise(10)
            .then(() => conf1.update({ a: 2 }))
            .catch(rej);
        });
      });
    });

    it('watch for changes in mixins sync', () => {
      const loader = new FileLoader({ file: configMixinProductionOne.path });
      const expectedLoadedConfig = _.merge({}, configMixinProductionOne.config, {
        __mixin__: productionMixin.config.mixin,
      });
      expect(loader.loadSync()).toEqual(expectedLoadedConfig);

      return new Promise((res, rej) => {
        loader.watch().on(
          'change',
          rejectIfError(rej, (name, conf) => {
            expect(name).toBe('change');
            expect(conf).toEqual(_.merge({}, expectedLoadedConfig, { __mixin__: { a: 2 } }));
            loader.unWatch();
            res();
          }),
        );
        return setTimeoutPromise(10)
          .then(() => productionMixin.update({ mixin: { a: 2 } }))
          .catch(rej);
      });
    });

    it('watch for changes in mixins async', () => {
      const loader = new FileLoader({ file: configMixinProductionOne.path });
      const expectedLoadedConfig = _.merge({}, configMixinProductionOne.config, {
        __mixin__: productionMixin.config.mixin,
      });

      return loader.load().then((config) => {
        expect(config).toEqual(expectedLoadedConfig);
        return new Promise((res, rej) => {
          loader.watch().on(
            'change',
            rejectIfError(rej, (name, conf) => {
              expect(name).toBe('change');
              expect(conf).toEqual(_.merge({}, expectedLoadedConfig, { __mixin__: { a: 2 } }));
              loader.unWatch();
              res();
            }),
          );
          return setTimeoutPromise(10)
            .then(() => productionMixin.update({ mixin: { a: 2 } }))
            .catch(rej);
        });
      });
    });
  });

  describe('#unWatch', () => {
    it('should allow un watching a file for changes', () => {
      const loader = new FileLoader({ file: conf1.path });
      expect(loader.loadSync()).toEqual(conf1.config);
      let called = 0;
      loader.watch().on('change', () => {
        loader.unWatch();
        called += 1;
      });
      return setTimeoutPromise(10)
        .then(() => conf1.update({ a: 2 }))
        .then(() => setTimeoutPromise(100))
        .then(() => expect(called).toBe(1))
        .then(() => conf1.update({ a: 3 }))
        .then(() => expect(called).toBe(1));
    });
  });
});
