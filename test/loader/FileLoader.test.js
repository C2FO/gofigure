process.env.NODE_ENV = '';
const assert = require('assert');
const _ = require('lodash');
const path = require('path');
const helper = require('../helper');
const FileLoader = require('../../lib/loader/FileLoader');

describe('FileLoader', () => {
    it('accept and set a file', () => {
        const loader = new FileLoader({ file: path.resolve(__dirname, '../configs//configs1/config1.json') });
        assert.strictEqual(loader.file, path.resolve(__dirname, '../configs//configs1/config1.json'));
    });

    beforeEach(() => {
        helper.createConfigs();
    });

    afterEach(() => {
        helper.createConfigs();
    });

    describe('#loadSync', () => {
        it('load a file', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../configs/configs1/config1.json') });
            assert.deepStrictEqual(loader.loadSync(), helper.conf1);
            assert.deepStrictEqual(loader.config, helper.conf1);
        });

        describe('with mixins', () => {
            it('should load a file and merge in mixins', () => {
                const loader = new FileLoader({ file: path.resolve(__dirname, '../config-mixin/config-mixin.production-one.json') });
                const expectedConfig = _.merge(
                    {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
                );
                return loader.load().then((config) => {
                    assert.deepStrictEqual(config, expectedConfig);
                    assert.deepStrictEqual(loader.config, expectedConfig);
                });
            });
        });
    });

    describe('#load', () => {
        it('load a file asynchronously', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../configs/configs1/config1.json') });
            return loader.load().then((conf) => {
                assert.deepStrictEqual(conf, helper.conf1);
                assert.deepStrictEqual(loader.config, helper.conf1);
            });
        });

        describe('with mixins', () => {
            it('should load a file and merge in mixins', () => {
                const loader = new FileLoader({ file: path.resolve(__dirname, '../config-mixin/config-mixin.production-one.json') });
                const expectedConfig = _.merge(
                    {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
                );
                return loader.load().then((config) => {
                    assert.deepStrictEqual(config, expectedConfig);
                    assert.deepStrictEqual(loader.config, expectedConfig);
                });
            });
        });
    });

    describe('#watch', () => {
        it('watch a file for changes sync', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../configs/configs1/config1.json') });
            assert.deepStrictEqual(loader.loadSync(), helper.conf1);

            return new Promise((res, rej) => {
                loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                    assert.strictEqual(name, 'change');
                    assert.deepStrictEqual(conf, _.merge({}, helper.conf1, { a: 2 }));
                    loader.unWatch();
                    res();
                }));
                return helper.setTimeoutPromise(10)
                    .then(() => helper.updateConfig('conf1', { a: 2 }))
                    .catch(rej);
            });
        });

        it('watch a file for changes async', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../configs/configs1/config1.json') });
            return loader.load().then((config) => {
                assert.deepStrictEqual(config, helper.conf1);

                return new Promise((res, rej) => {
                    loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                        assert.strictEqual(name, 'change');
                        assert.deepStrictEqual(conf, _.merge({}, helper.conf1, { a: 2 }));
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
            const loader = new FileLoader({ file: path.resolve(__dirname, '../config-mixin/config-mixin.production-one.json') });
            const expectedLoadedConfig = _.merge(
                {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
            );
            assert.deepStrictEqual(loader.loadSync(), expectedLoadedConfig);

            return new Promise((res, rej) => {
                loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                    assert.strictEqual(name, 'change');
                    assert.deepStrictEqual(
                        conf,
                        _.merge({}, expectedLoadedConfig, { __mixin__: { a: 2 } })
                    );
                    loader.unWatch();
                    res();
                }));
                return helper.setTimeoutPromise(10)
                    .then(() => helper.updateConfig('productionMixin', { mixin: { a: 2 } }))
                    .catch(rej);
            });
        });

        it('watch for changes in mixins async', () => {
            const loader = new FileLoader({ file: path.resolve(__dirname, '../config-mixin/config-mixin.production-one.json') });
            const expectedLoadedConfig = _.merge(
                {}, helper.configMixinProductionOne, { __mixin__: helper.productionMixin.mixin }
            );

            return loader.load().then((config) => {
                assert.deepStrictEqual(config, expectedLoadedConfig);
                return new Promise((res, rej) => {
                    loader.watch().on('change', helper.rejectIfError(rej, (name, conf) => {
                        assert.strictEqual(name, 'change');
                        assert.deepStrictEqual(
                            conf,
                            _.merge({}, expectedLoadedConfig, { __mixin__: { a: 2 } })
                        );
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
            const loader = new FileLoader({ file: path.resolve(__dirname, '../configs/configs1/config1.json') });
            assert.deepStrictEqual(loader.loadSync(), helper.conf1);
            let called = 0;
            loader.watch().on('change', () => {
                loader.unWatch();
                called += 1;
            });
            return helper.setTimeoutPromise(10)
                .then(() => helper.updateConfig('conf1', { a: 2 }))
                .then(() => helper.setTimeoutPromise(100))
                .then(() => assert.strictEqual(called, 1))
                .then(() => helper.updateConfig('conf1', { a: 3 }))
                .then(() => assert.strictEqual(called, 1));
        });
    });
});
