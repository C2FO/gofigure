/**
 * @projectName gofigure
 * @github http://github.com/C2FO/gofigure
 * @header [../README.md]
 */
"use strict";
var _ = require("./extended"),
    PatternEventEmitter = require("./events").PatternEventEmitter,
    toArray = _.toArray,
    bind = _.bind,
    partial = _.partial,
    Loader = require("./loader");

var Config = PatternEventEmitter.extend({
    instance: {

        loaders: null,

        loaded: null,

        locations: null,

        files: null,

        monitor: false,

        environment: process.env.NODE_ENV || null,

        nodetype: process.env.NODE_TYPE || null,

        defaultEnvironment: "*",

        config: null,

        ignoreMissing: true,

        constructor: function (locations, files, opts) {
            this._super(arguments);
            this.loaders = [];
            this.loaded = [];
            this.locations = [];
            this.files = [];
            opts = opts || {};
            this.config = {};
            if (_.isHash(files)) {
                opts = files;
                files = null;
            }
            if (locations) {
                this.locations = toArray(locations || []).reverse();
            }
            if (files) {
                this.files = toArray(files || []).reverse();
            }
            _.merge(this, opts);
        },

        stop: function () {
            this.loaders.forEach(function (l) {
                l.unWatch();
            });
            return this;
        },

        __merge: function (path, o1, o2) {
            //check for deleted values
            var o1Keys = Object.keys(o1), o2Keys = Object.keys(o2);
            o1Keys.sort();
            o2Keys.sort();
            if (!_.deepEqual(o1Keys, o2Keys)) {
                o2Keys.forEach(function (k) {
                    if (o1Keys.indexOf(k) === -1) {
                        var newPath = path ? [path, k].join(".") : k;
                        delete o2[k];
                        this.emit(newPath, undefined);
                    }
                }, this);
            }
            o1Keys.forEach(function (j) {
                var fVal = o1[j], tVal = o2[j];
                if (!_.deepEqual(fVal, tVal)) {
                    var newPath = path ? [path, j].join(".") : j;
                    if (_.isHash(fVal)) {
                        if (_.isHash(tVal)) {
                            this.__merge(newPath, fVal, tVal);
                        } else if (_.isUndefinedOrNull(tVal)) {
                            tVal = (o2[j] = {});
                            this.__merge(newPath, fVal, tVal);
                        } else {
                            o2[j] = fVal;
                        }
                    } else {
                        o2[j] = fVal;
                    }
                    this.emit(newPath, fVal);
                }
            }, this);
            return this;
        },

        __mergeConfigs: function (configs, emit) {
            var env = this.environment, 
                nodetype = this.nodetype, 
                defEnv = this.defaultEnvironment, 
                newConfig = _.deepMerge({}, this.config);
            configs.forEach(function (c) {
                if (env) {
                    c = _.deepMerge({}, 
                        c[defEnv] || {}, 
                        c[env] || {}, 
                        ((((c || {})['type'] || {})[env] || {})[nodetype] || {}));
                }
                _.deepMerge(newConfig, c);
            });
            this.__merge("", newConfig, this.config);
            return newConfig;
        },

        __mergeLoaders: function (loaders) {
            var configs = loaders.map(function (loader) {
                this.loaded = _.union(this.loaded, loader.files);
                loader.on("change", function (config) {
                    this.__mergeConfigs([config]);
                }.bind(this));
                return loader.config;
            }, this);
            this.__mergeConfigs(configs);
            return this;
        },


        load: function (cb) {
            var ret;
            if (!this.__loaded) {
                ret = _.when(this.locations.concat(this.files).map(function (f) {
                        var loader = new Loader(f, {monitor: this.monitor});
                        return loader.load().then(function () {
                            return loader;
                        });
                    }, this)).then(function (loaders) {
                        this.__loaded = true;
                        return this.__mergeLoaders(loaders).config;
                    }.bind(this));
            } else {
                ret = _.resolve(this.config);
            }
            ret.classic(cb);
            return ret;
        },

        loadSync: function () {
            if (!this.__loaded) {
                var ret = this.__mergeLoaders((this.loaders = this.locations.concat(this.files).map(function (f) {
                    var loader = new Loader(f, {monitor: this.monitor});
                    loader.loadSync();
                    return loader;
                }, this))).config;
                this.__loaded = true;
                return ret;
            } else {
                return this.config;
            }
        }
    }
});

function gofigure(options) {
    var files = options.files, locations = options.locations;
    delete options.files;
    delete options.locations;
    return new Config(locations, files, options);
}
gofigure.Loader = Loader;

module.exports = gofigure;
