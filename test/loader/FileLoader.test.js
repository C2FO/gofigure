process.env.NODE_ENV = '';
const _ = require('lodash');
const path = require('path');
const helper = require('../__fixtures__');
const FileLoader = require('../../lib/loader/FileLoader');

describe('FileLoader', () => {
    it('accept and set a file', () => {
        const loader = new FileLoader({ file: path.resolve(__dirname, '../configs/configs1/config1.json') });
        expect(loader.file).toBe(path.resolve(__dirname, '../configs/configs1/config1.json'));
    });

    beforeEach(() => {
        helper.createConfigs();
    });

    afterEach(() => {
        helper.createConfigs();
    });

    describe('#loadSync', () => {
        it('load a file', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/configs/configs1/config1.json') });
            expect(loader.loadSync()).toEqual(helper.conf1);
            expect(loader.config).toEqual(helper.conf1);
        });

        describe('with mixins', () => {
            it('should load a file and merge in mixins', () => {
                const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/config-mixin/config-mixin.production-one.json') });
                const expectedConfig = _.merge(
                    {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
                );
                return loader.load().then((config) => {
                    expect(config).toEqual(expectedConfig);
                    expect(loader.config).toEqual(expectedConfig);
                });
            });
        });
    });

    describe('#load', () => {
        it('load a file asynchronously', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/configs/configs1/config1.json') });
            return loader.load().then((conf) => {
                expect(conf).toEqual(helper.conf1);
                expect(loader.config).toEqual(helper.conf1);
            });
        });

        describe('with mixins', () => {
            it('should load a file and merge in mixins', () => {
                const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/config-mixin/config-mixin.production-one.json') });
                const expectedConfig = _.merge(
                    {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
                );
                return loader.load().then((config) => {
                    expect(config).toEqual(expectedConfig);
                    expect(loader.config).toEqual(expectedConfig);
                });
            });
        });
    });

    describe('#watch', () => {
        it('watch a file for changes sync', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/configs/configs1/config1.json') });
            expect(loader.loadSync()).toEqual(helper.conf1);

            return new Promise((res, rej) => {
                loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                    expect(name).toBe('change');
                    expect(conf).toEqual(_.merge({}, helper.conf1, { a: 2 }));
                    loader.unWatch();
                    res();
                }));
                return helper.setTimeoutPromise(10)
                    .then(() => helper.updateConfig('conf1', { a: 2 }))
                    .catch(rej);
            });
        });

        it('watch a file for changes async', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/configs/configs1/config1.json') });
            return loader.load().then((config) => {
                expect(config).toEqual(helper.conf1);

                return new Promise((res, rej) => {
                    loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                        expect(name).toBe('change');
                        expect(conf).toEqual(_.merge({}, helper.conf1, { a: 2 }));
                        loader.unWatch();
                        res();
                    }));
                    return helper.setTimeoutPromise(10)
                        .then(() => helper.updateConfig('conf1', { a: 2 }))
                        .catch(rej);
                });
            });
        });

        it('watch for changes in mixins sync', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/config-mixin/config-mixin.production-one.json') });
            const expectedLoadedConfig = _.merge(
                {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
            );
            expect(loader.loadSync()).toEqual(expectedLoadedConfig);

            return new Promise((res, rej) => {
                loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                    expect(name).toBe('change');
                    expect(conf).toEqual(_.merge({}, expectedLoadedConfig, { __mixin__: { a: 2 } }));
                    loader.unWatch();
                    res();
                }));
                return helper.setTimeoutPromise(10)
                    .then(() => helper.updateConfig('productionMixin', { mixin: { a: 2 } }))
                    .catch(rej);
            });
        });

        it('watch for changes in mixins async', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/config-mixin/config-mixin.production-one.json') });
            const expectedLoadedConfig = _.merge(
                {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
            );

            return loader.load().then((config) => {
                expect(config).toEqual(expectedLoadedConfig);
                return new Promise((res, rej) => {
                    loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                        expect(name).toBe('change');
                        expect(conf).toEqual(_.merge({}, expectedLoadedConfig, { __mixin__: { a: 2 } }));
                        loader.unWatch();
                        res();
                    }));
                    return helper.setTimeoutPromise(10)
                        .then(() => helper.updateConfig('productionMixin', { mixin: { a: 2 } }))
                        .catch(rej);
                });
            });
        });
    });

    describe('#unWatch', () => {
        it('should allow un watching a file for changes', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../__fixtures__/configs/configs1/config1.json') });
            expect(loader.loadSync()).toEqual(helper.conf1);
            let called = 0;
            loader.watch().on('change', () => {
                loader.unWatch();
                called += 1;
            });
            return helper.setTimeoutPromise(10)
                .then(() => helper.updateConfig('conf1', { a: 2 }))
                .then(() => helper.setTimeoutPromise(100))
                .then(() => expect(called).toBe(1))
                .then(() => helper.updateConfig('conf1', { a: 3 }))
                .then(() => expect(called).toBe(1));
        });
    });
});
