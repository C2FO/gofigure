'use strict';

process.env.NODE_ENV = '';
const assert = require('assert');
const _ = require('lodash');
const path = require('path');
const nock = require('nock');
const helper = require('../helper');
const EtcdLoader = require('../../lib/loader/EtcdLoader');

nock.load(path.resolve(__dirname, '../config-etcd/queries.json'));

describe('EtcdLoader', () => {
    beforeEach(() => {
        helper.createConfigs();
    });

    afterEach(() => {
        helper.createConfigs();
    });

    it('properly configure the etcd endpoint', () => {
        const loader = new EtcdLoader({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/gruntit' } });
        assert.strictEqual(loader.etcd.endpoints[0], [ '127.0.0.1:4001' ][0]);
        assert.strictEqual(loader.etcd.root, '/gruntit');
    });


    describe('#loadSync', () => {
        it('load from etcd', () => {
            const loader = new EtcdLoader({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/gruntit' } });
            assert.deepStrictEqual(loader.loadSync(), helper.sharedEnvConf);
            assert.deepStrictEqual(loader.config, helper.sharedEnvConf);
        });
    });

    describe('#load', () => {
        it('load from etcd asynchronously', () => {
            const loader = new EtcdLoader({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/gruntit' } });
            return loader.load().then((conf) => {
                assert.deepStrictEqual(conf, helper.sharedEnvConf);
                assert.deepStrictEqual(loader.config, helper.sharedEnvConf);
            });
        });
    });

    describe('#watch', () => {
        it('watch a file for changes in etcd', (next) => {
            const loader = new EtcdLoader({ etcd: { endpoints: [ '127.0.0.1:4001' ], root: '/gruntit' } });
            assert.deepEqual(loader.loadSync(), helper.sharedEnvConf);
            loader.watch().on('change', (event, conf) => {
                assert.strictEqual(event, 'change');
                assert.deepStrictEqual(conf, _.merge({}, helper.sharedEnvConf, { test: { b: 2 } }));
                loader.unWatch();
                next();
            });
        });
    });
});
