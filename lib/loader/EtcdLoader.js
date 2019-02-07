'use strict';

const Etcd = require('node-etcd');
const _ = require('lodash');
const PatternEventEmitter = require('../PatternEventEmitter');
const helpers = require('../helpers');
const loaderHelpers = require('./loaderHelpers');

class EtcdLoader extends PatternEventEmitter {
    constructor(opts) {
        super({});
        const options = opts || {};
        if (!options.etcd) {
            throw new Error('Etcd configuration required for etcd loader');
        }
        const etcd = options.etcd;
        if (!etcd.endpoints) {
            throw new Error('Endpoints are required for etcd loader');
        }
        if (!etcd.root) {
            throw new Error('root required for etcd loader');
        }

        this.watching = false;
        this.loaded = false;
        this.monitor = !!opts.monitor;
        this.etcd = etcd;
        this.__etcdRoot = this.etcd.root;
        this.__etcdPropRegex = new RegExp(`^${this.__etcdRoot}/(?:[^/]+/)*([^/]+)$`);
        this.__etcdClient = new Etcd(etcd.endpoints, etcd.sslOptions || null);
        this.__etcdWatcher = null;
    }

    watchHandler(event, etcdNode) {
        if (this.__etcdWatcher) {
            if (event === 'change') {
                const propertyPath = etcdNode.node.key.replace(this.__etcdRoot, '')
                    .replace(/\+/g, ' ')
                    .replace(/\/+/g, '.');
                this.config = loaderHelpers.mergeConfigs([
                    this.config,
                    _.set({}, propertyPath, JSON.parse(etcdNode.node.value)),
                ]);
                this.emit('change', this.config);
            }
        }
    }

    unWatch() {
        if (this.watching) {
            this.watching = false;
            this.__etcdWatcher.stop();
        }
        return this;
    }

    watch() {
        if (!this.__etcdWatcher) {
            this.watching = true;
            this.__etcdWatcher = this.__etcdClient.watcher(this.__etcdRoot, null, { recursive: true });
            this.__etcdWatcher.on('change', etcdNode => this.watchHandler('change', etcdNode));
        }
        return this;
    }

    loadSync() {
        if (this.loaded) {
            return this.config;
        }
        const etcdResponse = this.__etcdClient.getSync(this.__etcdRoot, { recursive: true });
        if (etcdResponse.err) {
            throw new Error(`Etcd problem:  ${etcdResponse.err.message}`);
        }
        return this.__processNodes(etcdResponse.body.node.nodes);
    }

    load() {
        if (this.loaded) {
            return Promise.resolve(this.config);
        }
        const etcdGet = helpers.denodeify(this.__etcdClient.get, this.__etcdClient);
        return etcdGet(this.__etcdRoot, { recursive: true })
            .then(etcdbody => this.__processNodes(etcdbody.node.nodes));
    }

    __processNodes(etcdNodes) {
        const recurseNodes = (nodes, config) => {
            if (!nodes) {
                return {};
            }
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i].dir) {
                    // its directory so keep recursing
                    const pathMatch = this.__etcdPropRegex.exec(nodes[i].key);
                    if (pathMatch && pathMatch.length === 2) {
                        config[pathMatch[1]] = this.__processNodes(nodes[i].nodes, {});
                    }
                } else {
                    const pathMatch = this.__etcdPropRegex.exec(nodes[i].key);
                    config[pathMatch[1]] = JSON.parse(nodes[i].value);
                }
            }
            return config;
        };
        this.config = recurseNodes(etcdNodes, {});
        this.loaded = true;
        if (this.monitor) {
            this.watch();
        }
        return this.config;
    }
}

module.exports = EtcdLoader;
