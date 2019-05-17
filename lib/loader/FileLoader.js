

const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const PatternEventEmitter = require('../PatternEventEmitter');
const helpers = require('../helpers');
const loaderHelpers = require('./loaderHelpers');

const readFileP = helpers.denodeify(fs.readFile, fs);

const CHANGE_EVENT = 'change';

class FileLoader extends PatternEventEmitter {
    static readFile(filePath) {
        try {
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch (e) {
            throw new Error(`Error parsing ${filePath}: ${e.message}`);
        }
    }

    static readFileAsync(filePath) {
        return readFileP(filePath, 'utf8').then(contents => JSON.parse(contents));
    }

    constructor(opts) {
        super({});
        const options = opts || {};
        if (!options.file) {
            throw new Error('files to load are required');
        }
        this.monitor = !!options.monitor;
        this.file = options.file;
        this.watchTimeout = null;
        this.loaded = false;
        this.mixinFiles = new Set();
        this.fileWatchers = new Map();
    }

    watchHandler(event) {
        if (event === CHANGE_EVENT) {
            clearTimeout(this.watchTimeout);
            // use a timeout incase the file changes again
            this.watchTimeout = setTimeout(() => {
                FileLoader.readFileAsync(this.file)
                    .then(contents => this.__processConfigAsync(contents))
                    .then((config) => {
                        this.config = config;
                        this.emit(CHANGE_EVENT, this.config);
                    });
            }, 10);
        }
    }

    unWatch() {
        if (this.fileWatchers.size) {
            clearTimeout(this.watchTimeout);
            [ ...this.fileWatchers.values() ].forEach(watcher => watcher.close());
            this.fileWatchers.clear();
        }
        return this;
    }

    watch() {
        this.__addWatcher(this.file);
        [ ...this.mixinFiles.keys() ].forEach(mixinPath => this.__addWatcher(mixinPath));
        return this;
    }

    loadSync() {
        if (this.loaded) {
            return this.config;
        }
        return this.__postLoad(this.__getConfigOrRead());
    }

    load() {
        if (this.loaded) {
            return Promise.resolve(this.config);
        }
        return this.__getConfigOrReadAsync().then(config => this.__postLoad(config));
    }

    __getConfigOrRead() {
        return this.__processConfig(FileLoader.readFile(this.file));
    }

    __getConfigOrReadAsync() {
        return FileLoader.readFileAsync(this.file)
            .then(fileConfig => this.__processConfigAsync(fileConfig));
    }

    __processConfig(config) {
        if (Array.isArray(config.mixins)) {
            const mixinPaths = config.mixins
                .map(ep => this.__addToMixins(path.resolve(path.dirname(this.file), ep)));
            const mixinConfig = loaderHelpers.mergeConfigs(mixinPaths.map(mp => FileLoader.readFile(mp)));
            return FileLoader.addMixinToConfig(config, mixinConfig);
        }
        return config;
    }

    __processConfigAsync(config) {
        if (Array.isArray(config.mixins)) {
            const mixinPaths = config.mixins
                .map(ep => this.__addToMixins(path.resolve(path.dirname(this.file), ep)));
            return Promise.all(mixinPaths.map(mp => FileLoader.readFileAsync(mp)))
                .then((mixinConfigs) => {
                    const mixinConfig = loaderHelpers.mergeConfigs(mixinConfigs);
                    return FileLoader.addMixinToConfig(config, mixinConfig);
                });
        }
        return config;
    }

    __postLoad(config) {
        this.config = config;
        this.loaded = true;
        if (this.monitor) {
            this.watch();
        }
        return this.config;
    }

    __addToMixins(mixinPath) {
        this.mixinFiles.add(mixinPath);
        return mixinPath;
    }

    __addWatcher(filePath) {
        if (!this.fileWatchers.has(filePath)) {
            this.fileWatchers.set(filePath, fs.watch(filePath, event => this.watchHandler(event)));
        }
    }

    static addMixinToConfig(config, mixin) {
        return _.merge({}, config, { __mixin__: mixin.mixin });
    }
}

module.exports = FileLoader;
