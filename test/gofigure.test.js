'use strict';

process.env.NODE_ENV = '';

const assert = require('assert');
const path = require('path');
const nock = require('nock');
const _ = require('lodash');

const helper = require('./helper');
const goFigure = require('../index.js');

const conf1 = helper.conf1;
const conf2 = helper.conf2;
const envConf = helper.envConf;
const sharedEnvConf = helper.sharedEnvConf;


describe('gofigure', () => {
    nock.load(path.resolve(__dirname, 'config-etcd/gofigure_queries.json'));
    beforeEach(() => helper.createConfigs());

    afterEach(() => helper.createConfigs());

    const createUpdatesPromise = (configName, updates) => updates.reduce((p, change) => {
        return p.then(() => helper.updateConfig(configName, change))
            .then(() => helper.setTimeoutPromise(200));
    }, helper.setTimeoutPromise(10));

    describe('#load', () => {
        it('load configuration from directories', () => {
            const config1 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs1') ] });
            const config2 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs2') ] });
            return config1.load()
                .then(config => assert.deepStrictEqual(config, conf1))
                .then(() => config2.load())
                .then(config => assert.deepStrictEqual(config, conf2));
        });

        it('load configuration from etcd', () => {
            const config1 = goFigure({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/configs1' } });
            const config2 = goFigure({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/configs2' } });
            return config1.load()
                .then(config => assert.deepStrictEqual(config, conf1))
                .then(() => config2.load())
                .then(config => assert.deepStrictEqual(config, conf2));
        });

        it('load configuration from files', () => {
            const config1 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs1/config1.json') ] });
            const config2 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs2/config2.json') ] });
            return config1.load()
                .then(config => assert.deepStrictEqual(config, conf1))
                .then(() => config2.load())
                .then(config => assert.deepStrictEqual(config, conf2));
        });

        describe('with an env', () => {
            it('from directories', () => {
                const configDev = goFigure({ environment: 'development', locations: [ path.resolve(__dirname, 'configs/config-env') ] });
                const configProd = goFigure({ environment: 'production', locations: [ path.resolve(__dirname, 'configs/config-env') ] });
                const configTest = goFigure({ environment: 'test', locations: [ path.resolve(__dirname, 'configs/config-env') ] });
                return configDev.load()
                    .then(config => assert.deepStrictEqual(config, envConf.development))
                    .then(() => configProd.load())
                    .then(config => assert.deepStrictEqual(config, envConf.production))
                    .then(() => configTest.load())
                    .then(config => assert.deepStrictEqual(config, envConf.test));
            });

            it('from etcd', () => {
                const configDev = goFigure({ environment: 'development', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-env' } });
                const configProd = goFigure({ environment: 'production', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-env' } });
                const configTest = goFigure({ environment: 'test', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-env' } });
                return configDev.load()
                    .then(config => assert.deepStrictEqual(config, envConf.development))
                    .then(() => configProd.load())
                    .then(config => assert.deepStrictEqual(config, envConf.production))
                    .then(() => configTest.load())
                    .then(config => assert.deepStrictEqual(config, envConf.test));
            });

            it('from files', () => {
                const configDev = goFigure({ environment: 'development', locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                const configProd = goFigure({ environment: 'production', locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                const configTest = goFigure({ environment: 'test', locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                return configDev.load()
                    .then(config => assert.deepStrictEqual(config, envConf.development))
                    .then(() => configProd.load())
                    .then(config => assert.deepStrictEqual(config, envConf.production))
                    .then(() => configTest.load())
                    .then(config => assert.deepStrictEqual(config, envConf.test));
            });
        });

        describe('with a mixin', () => {
            it('from directories', () => {
                const configDevOne = goFigure({ environment: 'development-one', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const devOne = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinDevelopmentOne['development-one'],
                    helper.developmentMixin.mixin);
                const configDevTwo = goFigure({ environment: 'development-two', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const devTwo = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinDevelopmentTwo['development-two'],
                    helper.developmentMixin.mixin);
                const configProdOne = goFigure({ environment: 'production-one', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const prodOne = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinProductionOne['production-one'],
                    helper.productionMixin.mixin);
                const configProdTwo = goFigure({ environment: 'production-two', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const prodTwo = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinProductionTwo['production-two'],
                    helper.productionMixin.mixin);
                return configDevOne.load()
                    .then(config => assert.deepStrictEqual(config, devOne))
                    .then(() => configDevTwo.load())
                    .then(config => assert.deepStrictEqual(config, devTwo))
                    .then(() => configProdOne.load())
                    .then(config => assert.deepStrictEqual(config, prodOne))
                    .then(() => configProdTwo.load())
                    .then(config => assert.deepStrictEqual(config, prodTwo));
            });

            it('from files', () => {
                const configDevOne = goFigure({ environment: 'development-one', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.development-one.json') ] });
                const devOne = _.merge({},
                    helper.configMixinDevelopmentOne['development-one'],
                    helper.developmentMixin.mixin);
                const configDevTwo = goFigure({ environment: 'development-two', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.development-two.json') ] });
                const devTwo = _.merge({},
                    helper.configMixinDevelopmentTwo['development-two'],
                    helper.developmentMixin.mixin);
                const configProdOne = goFigure({ environment: 'production-one', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.production-one.json') ] });
                const prodOne = _.merge({},
                    helper.configMixinProductionOne['production-one'],
                    helper.productionMixin.mixin);
                const configProdTwo = goFigure({ environment: 'production-two', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.production-two.json') ] });
                const prodTwo = _.merge({},
                    helper.configMixinProductionTwo['production-two'],
                    helper.productionMixin.mixin);
                return configDevOne.load()
                    .then(config => assert.deepStrictEqual(config, devOne))
                    .then(() => configDevTwo.load())
                    .then(config => assert.deepStrictEqual(config, devTwo))
                    .then(() => configProdOne.load())
                    .then(config => assert.deepStrictEqual(config, prodOne))
                    .then(() => configProdTwo.load())
                    .then(config => assert.deepStrictEqual(config, prodTwo));
            });
        });
    });

    describe('#loadSync', () => {
        it('load configuration from certain directories', () => {
            const config1 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs1') ] });
            const config2 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs2') ] });
            assert.deepStrictEqual(config1.loadSync(), conf1);
            assert.deepStrictEqual(config2.loadSync(), conf2);
        });

        it('load configuration from etcd', () => {
            const config1 = goFigure({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/configs1' } });
            const config2 = goFigure({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/configs2' } });
            assert.deepStrictEqual(config1.loadSync(), conf1);
            assert.deepStrictEqual(config2.loadSync(), conf2);
        });

        it('load configuration from certain files', () => {
            const config1 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs1/config1.json') ] });
            const config2 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs2/config2.json') ] });
            assert.deepStrictEqual(config1.loadSync(), conf1);
            assert.deepStrictEqual(config2.loadSync(), conf2);
        });

        it('load should call listeners when setting', () => {
            const config1 = goFigure({ locations: [ path.resolve(__dirname, 'configs/configs1/config1.json') ] });
            const res = [];
            [ 'a', 'b', 'b.c', 'b.f', 'e', 'e.f', 'e.g', 'e.g.h' ].forEach((topic) => {
                config1.on(topic, (k, v) => {
                    res.push([ topic, k, v ]);
                });
            });
            assert.deepStrictEqual(config1.loadSync(), conf1);
            return helper.setTimeoutPromise(50)
                .then(() => {
                    assert.deepStrictEqual(res, [
                        [ 'a', 'a', 1 ],
                        [ 'b', 'b', { c: 1, d: 2 } ],
                        [ 'b.c', 'b.c', 1 ],
                        [ 'e', 'e', { f: 3, g: { h: 4 } } ],
                        [ 'e.f', 'e.f', 3 ],
                        [ 'e.g', 'e.g', { h: 4 } ],
                        [ 'e.g.h', 'e.g.h', 4 ],
                    ]);
                });
        });

        describe('with an env', () => {
            it('from directories', () => {
                const configDev = goFigure({ environment: 'development', locations: [ path.resolve(__dirname, 'configs/config-env') ] });
                const configProd = goFigure({ environment: 'production', locations: [ path.resolve(__dirname, 'configs/config-env') ] });
                const configTest = goFigure({ environment: 'test', locations: [ path.resolve(__dirname, 'configs/config-env') ] });
                assert.deepStrictEqual(configDev.loadSync(), envConf.development);
                assert.deepStrictEqual(configProd.loadSync(), envConf.production);
                assert.deepStrictEqual(configTest.loadSync(), envConf.test);
            });

            it('from etcd', () => {
                const configDev = goFigure({ environment: 'development', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-env' } });
                const configProd = goFigure({ environment: 'production', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-env' } });
                const configTest = goFigure({ environment: 'test', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-env' } });
                assert.deepStrictEqual(configDev.loadSync(), envConf.development);
                assert.deepStrictEqual(configProd.loadSync(), envConf.production);
                assert.deepStrictEqual(configTest.loadSync(), envConf.test);
            });

            it('from files', () => {
                const configDev = goFigure({ environment: 'development', locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                const configProd = goFigure({ environment: 'production', locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                const configTest = goFigure({ environment: 'test', locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                assert.deepStrictEqual(configDev.loadSync(), envConf.development);
                assert.deepStrictEqual(configProd.loadSync(), envConf.production);
                assert.deepStrictEqual(configTest.loadSync(), envConf.test);
            });
        });

        describe('with an shared env', () => {
            it('from directories', () => {
                const configDev = goFigure({ environment: 'development', locations: [ path.resolve(__dirname, 'configs/config-shared-env') ] });
                const configProd = goFigure({ environment: 'production', locations: [ path.resolve(__dirname, 'configs/config-shared-env') ] });
                const configTest = goFigure({ environment: 'test', locations: [ path.resolve(__dirname, 'configs/config-shared-env') ] });
                assert.deepStrictEqual(configDev.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.development));
                assert.deepStrictEqual(configProd.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.production));
                assert.deepStrictEqual(configTest.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.test));
            });

            it('from etcd', () => {
                const configDev = goFigure({ environment: 'development', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-shared-env' } });
                const configProd = goFigure({ environment: 'production', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-shared-env' } });
                const configTest = goFigure({ environment: 'test', etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/config-shared-env' } });
                assert.deepStrictEqual(configDev.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.development));
                assert.deepStrictEqual(configProd.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.production));
                assert.deepStrictEqual(configTest.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.test));
            });

            it('from files', () => {
                const configDev = goFigure({ environment: 'development', locations: [ path.resolve(__dirname, 'configs/config-shared-env/config.json') ] });
                const configProd = goFigure({ environment: 'production', locations: [ path.resolve(__dirname, 'configs/config-shared-env/config.json') ] });
                const configTest = goFigure({ environment: 'test', locations: [ path.resolve(__dirname, 'configs/config-shared-env/config.json') ] });
                assert.deepStrictEqual(configDev.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.development));
                assert.deepStrictEqual(configProd.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.production));
                assert.deepStrictEqual(configTest.loadSync(), _.merge({}, sharedEnvConf['*'], sharedEnvConf.test));
            });
        });

        describe('with a mixin', () => {
            it('from directories', () => {
                const configDevOne = goFigure({ environment: 'development-one', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const devOne = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinDevelopmentOne['development-one'],
                    helper.developmentMixin.mixin);
                const configDevTwo = goFigure({ environment: 'development-two', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const devTwo = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinDevelopmentTwo['development-two'],
                    helper.developmentMixin.mixin);
                const configProdOne = goFigure({ environment: 'production-one', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const prodOne = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinProductionOne['production-one'],
                    helper.productionMixin.mixin);
                const configProdTwo = goFigure({ environment: 'production-two', locations: [ path.resolve(__dirname, 'config-mixin') ] });
                const prodTwo = _.merge({},
                    helper.configMixinDefault['*'],
                    helper.configMixinProductionTwo['production-two'],
                    helper.productionMixin.mixin);
                assert.deepStrictEqual(configDevOne.loadSync(), devOne);
                assert.deepStrictEqual(configDevTwo.loadSync(), devTwo);
                assert.deepStrictEqual(configProdOne.loadSync(), prodOne);
                assert.deepStrictEqual(configProdTwo.loadSync(), prodTwo);
            });

            it('from files', () => {
                const configDevOne = goFigure({ environment: 'development-one', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.development-one.json') ] });
                const devOne = _.merge({},
                    helper.configMixinDevelopmentOne['development-one'],
                    helper.developmentMixin.mixin);
                const configDevTwo = goFigure({ environment: 'development-two', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.development-two.json') ] });
                const devTwo = _.merge({},
                    helper.configMixinDevelopmentTwo['development-two'],
                    helper.developmentMixin.mixin);
                const configProdOne = goFigure({ environment: 'production-one', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.production-one.json') ] });
                const prodOne = _.merge({},
                    helper.configMixinProductionOne['production-one'],
                    helper.productionMixin.mixin);
                const configProdTwo = goFigure({ environment: 'production-two', locations: [ path.resolve(__dirname, 'config-mixin/config-mixin.production-two.json') ] });
                const prodTwo = _.merge({},
                    helper.configMixinProductionTwo['production-two'],
                    helper.productionMixin.mixin);
                assert.deepStrictEqual(configDevOne.loadSync(), devOne);
                assert.deepStrictEqual(configDevTwo.loadSync(), devTwo);
                assert.deepStrictEqual(configProdOne.loadSync(), prodOne);
                assert.deepStrictEqual(configProdTwo.loadSync(), prodTwo);
            });
        });
    });

    describe('#on', () => {
        it('monitor configurations in certain directories', () => {
            const config1 = goFigure({ monitor: true, locations: [ path.resolve(__dirname, 'configs/configs1') ] });
            config1.loadSync();
            const res = [];
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
                config1.on(topic, (key, val) => {
                    res.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
                });
            });
            const changes = [
                { a: 4 },
                { b: { c: 5 } },
                { b: { d: 7 } },
                { e: { f: 8 } },
                { e: { g: { h: 9 } } },
            ];
            return createUpdatesPromise('conf1', changes).then(() => {
                config1.stop();
                assert.deepStrictEqual(res, [
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

        it('monitor configurations in etcd', (next) => {
            const config1 = goFigure({ monitor: true, etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/configs1' } });
            config1.loadSync();
            const events = [];
            const assertCheck = () => {
                config1.stop();
                assert.deepStrictEqual(events, [
                    { key: 'a', val: 4 },
                    { key: 'b.c', val: 5 },
                    { key: 'b.d', val: 7 },
                    { key: 'e', val: { f: 3, g: { h: 9 } } },
                    { key: 'e.g', val: { h: 9 } },
                    { key: 'e.g.h', val: 9 },
                ]);
                next();
            };
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
                config1.on(topic, (key, val) => {
                    events.push({ key, val: _.isPlainObject(val) ? _.merge({}, val) : val });
                    if (events.length === 6) {
                        assertCheck();
                    }
                });
            });
        });

        it('monitor configurations of files', () => {
            const config1 = goFigure({ monitor: true, locations: [ path.resolve(__dirname, 'configs/configs1/config1.json') ] });
            config1.loadSync();
            const events = [];
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
                config1.on(topic, (key, val) => {
                    events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
                });
            });
            const changes = [
                { a: 4 },
                { b: { c: 5 } },
                { b: { d: 7 } },
                { e: { f: 8 } },
                { e: { g: { h: 9 } } },
            ];
            return createUpdatesPromise('conf1', changes).then(() => {
                config1.stop();
                assert.deepStrictEqual(events, [
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
                locations: [
                    { monitor: true, file: path.resolve(__dirname, 'configs/configs1/config1.json') },
                ],
            });
            config1.loadSync();
            const events = [];
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
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
                assert.deepStrictEqual(events, [
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
                const configs = [ 'development', 'production', 'test' ].map((env) => {
                    const config = goFigure({ monitor: true, environment: env, locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                    config.loadSync();
                    events[env] = [];
                    [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
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
                    _.invoke(configs, 'stop');
                    assert.deepStrictEqual(events, {
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
            const config1 = goFigure({ monitor: true, locations: [ path.resolve(__dirname, 'configs/configs1') ] });
            config1.loadSync();
            const res = [];
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
                config1.addListener(topic, (key, val) => {
                    res.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
                });
            });
            const changes = [
                { a: 4 },
                { b: { c: 5 } },
                { b: { d: 7 } },
                { e: { f: 8 } },
                { e: { g: { h: 9 } } },
            ];
            return createUpdatesPromise('conf1', changes).then(() => {
                config1.stop();
                assert.deepStrictEqual(res, [
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

        it('monitor configurations in etcd', (next) => {
            const config1 = goFigure({ monitor: true, etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/configs1' } });
            config1.loadSync();
            const events = [];
            const assertCheck = () => {
                config1.stop();
                assert.deepStrictEqual(events, [
                    { key: 'a', val: 4 },
                    { key: 'b.c', val: 5 },
                    { key: 'b.d', val: 7 },
                    { key: 'e', val: { f: 3, g: { h: 9 } } },
                    { key: 'e.g', val: { h: 9 } },
                    { key: 'e.g.h', val: 9 },
                ]);
                next();
            };
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
                config1.addListener(topic, (key, val) => {
                    events.push({ key, val: _.isPlainObject(val) ? _.merge({}, val) : val });
                    if (events.length === 6) {
                        assertCheck();
                    }
                });
            });
        });

        it('monitor configurations of files', () => {
            const config1 = goFigure({ monitor: true, locations: [ path.resolve(__dirname, 'configs/configs1/config1.json') ] });
            config1.loadSync();
            const events = [];
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
                config1.addListener(topic, (key, val) => {
                    events.push({ key, val: _.isObject(val) ? _.merge({}, val) : val });
                });
            });
            const changes = [
                { a: 4 },
                { b: { c: 5 } },
                { b: { d: 7 } },
                { e: { f: 8 } },
                { e: { g: { h: 9 } } },
            ];
            return createUpdatesPromise('conf1', changes).then(() => {
                config1.stop();
                assert.deepStrictEqual(events, [
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
                locations: [
                    { monitor: true, file: path.resolve(__dirname, 'configs/configs1/config1.json') },
                ],
            });
            config1.loadSync();
            const events = [];
            [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
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
                assert.deepStrictEqual(events, [
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
                const configs = [ 'development', 'production', 'test' ].map((env) => {
                    const config = goFigure({ monitor: true, environment: env, locations: [ path.resolve(__dirname, 'configs/config-env/config.json') ] });
                    config.loadSync();
                    events[env] = [];
                    [ 'a', 'b.{c|d}', 'e', 'e.g', 'e.g.*' ].forEach((topic) => {
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
                    _.invoke(configs, 'stop');
                    assert.deepStrictEqual(events, {
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
            const config1 = goFigure({ monitor: true, locations: [ path.resolve(__dirname, 'configs/configs1') ] });
            config1.loadSync();
            const events = [];
            config1.once('a', (key, val) => events.push({ key, val, type: 'once' }));
            config1.on('a', (key, val) => events.push({ key, val, type: 'on' }));

            const changes = [
                { a: 4 },
                { a: 1 },
            ];
            return createUpdatesPromise('conf1', changes).then(() => {
                config1.stop();
                assert.deepStrictEqual(events, [
                    { key: 'a', val: 4, type: 'once' },
                    { key: 'a', val: 4, type: 'on' },
                    { key: 'a', val: 1, type: 'on' },
                ]);
            });
        });
    });

    describe('#removeListener', () => {
        it('should stop listening', () => {
            const config1 = goFigure({ monitor: true, locations: [ path.resolve(__dirname, 'configs/configs1') ] });
            config1.loadSync();
            const events = [];
            const onAndRemove = (key, val) => {
                events.push({ key, val, type: 'onAndRemove' });
                config1.removeListener('a', onAndRemove);
            };
            config1.on('a', onAndRemove);
            config1.on('a', (key, val) => events.push({ key, val, type: 'on' }));

            const changes = [
                { a: 4 },
                { a: 1 },
            ];
            return createUpdatesPromise('conf1', changes).then(() => {
                config1.stop();
                assert.deepStrictEqual(events, [
                    { key: 'a', val: 4, type: 'onAndRemove' },
                    { key: 'a', val: 4, type: 'on' },
                    { key: 'a', val: 1, type: 'on' },
                ]);
            });
        });
    });
});
