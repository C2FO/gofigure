/**
 * @projectName gofigure
 * @github http://github.com/C2FO/gofigure
 * @header [../README.md]
 * @includeDoc [Change Log] ../History.md
 */

'use strict';

const _ = require('lodash');
const PatternEventEmitter = require('./PatternEventEmitter');
const loader = require('./loader');
const processor = require('./processor');

class Config extends PatternEventEmitter {
    constructor(loaderConfig, opts) {
        super({});
        if (!loaderConfig) {
            throw new Error('A loader configuration is required');
        }
        const options = opts || {};
        this.environment = options.environment || process.env.NODE_ENV || null;
        this.nodeType = options.nodeType || process.env.NODE_TYPE || null;
        this.environmentVariables = options.environmentVariables || process.env || {};
        this.defaultEnvironment = options.defaultEnvironment || '*';
        this.config = {};
        this.monitor = !!options.monitor;
        this.loaderConfig = loaderConfig;
        this.loaded = false;
    }

    stop() {
        this.__loaders.forEach(l => l.unWatch());
        return this;
    }


    load() {
        if (this.__loaded) {
            return Promise.resolve(this.config);
        }
        return loader.createLoadersAsync(this.loaderConfig, { monitor: this.monitor })
            .then((loaders) => {
                this.__loaders = loaders;
                const loads = loaders.map(l => l.load());
                return Promise.all(loads)
                    .then(configs => this.__postLoad(configs));
            });
    }

    loadSync() {
        if (this.__loaded) {
            return this.config;
        }
        this.__loaders = loader.createLoadersSync(this.loaderConfig, { monitor: this.monitor });
        return this.__postLoad(this.__loaders.map(l => l.loadSync()));
    }

    __mergeConfigs(configs) {
        return processor(_.cloneDeep(this.config), configs, {
            environment: this.environment,
            defaultEnvironment: this.defaultEnvironment,
            nodeType: this.nodeType,
            eventEmitter: this,
            environmentVariables: this.environmentVariables,
        });
    }

    __postLoad(configs) {
        this.config = this.__mergeConfigs(configs);
        this.__listenToChanges();
        this.__loaded = true;
        return this.config;
    }

    __listenToChanges() {
        this.__loaders.forEach(l => l.on('change', (path, config) => {
            this.config = this.__mergeConfigs([ config ]);
        }));
    }
}

function gofigure(options) {
    const locations = (options.locations || []).map((file) => {
        if (_.isPlainObject(file)) {
            return file;
        }
        return { file };
    });
    const etcd = options.etcd;
    delete options.locations;
    delete options.etcd;
    if (!locations && !etcd) {
        throw new Error('Please provide either locations or etcd endpoints');
    }
    return new Config({
        locations,
        etcd,
    }, options);
}

module.exports = gofigure;
