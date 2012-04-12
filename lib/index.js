"use strict";
var comb = require("comb"),
    toArray = comb.array.toArray,
    hitch = comb.hitch,
    partial = comb.partial,
    path = require("path"),
    fs = require("fs");


var cwd = process.cwd();
var readFiles = function (files, dir) {
    var configs = {};
    files.forEach(function (f) {
        try {
            var p = path.resolve(dir || cwd, f);
            configs[p] = require(p);
        } catch (e) {
            console.error("Error loading " + f);
            console.error(e.stack);
        }
    });
    return configs;
};
var getConfigs = function (dir, sync) {
    if (sync) {
        return readFiles(fs.readdirSync(dir), dir);
    } else {
        var ret = new comb.Promise();
        fs.readdir(dir, function (err, files) {
            if (!err) {
                ret.callback(readFiles(files, dir));
            } else {
                ret.errback(err);
            }
        });
        return ret;
    }

};

var watchedFiles = {};
var watchFiles = function (files, cb) {
    files.forEach(function (file) {
        if (!watchedFiles[file]) {
            var listeners = (watchedFiles[file] = []);
            fs.watch(file, {}, function (event, filename) {
                if (event == "change") {
                    delete require.cache[file];
                    process.nextTick(function () {
                        listeners.forEach(function (cb) {
                            process.nextTick(partial(cb, file));
                        });
                    });
                }
            });
        } else {
            watchedFiles[file].push(cb);
        }
    })
};

var Config = comb.define(null, {
    instance:{

        loaded:null,

        locations:null,

        files:null,

        monitor:false,

        environment:process.env.NODE_ENV || null,

        config:null,

        ignoreMissing:true,

        constructor:function (locations, files, opts) {
            this.loaded = [];
            opts = opts || {};
            this.config = {};
            this.__listeners = {};
            if (comb.isHash(files)) {
                opts = files;
                files = null;
            }
            if (locations) {
                this.locations = toArray(locations || []).reverse();
            }
            if (files) {
                this.files = toArray(files || []).reverse();
            }
            for (var i in opts) {
                this[i] = opts[i];
            }
        },

        _monitor:function (f, force) {
            f = f || this.loaded;
            if (this.monitor || force) {
                watchFiles(f, hitch(this, function (file) {
                    var config = readFiles(f), newC = {};
                    for (var i in config) {
                        var c = config[i];
                        if (this.environment) {
                            c = c[this.environment] || {};
                        }
                        comb.deepMerge(newC, c);
                    }
                    this.__merge("", newC, this.config);
                }));
            }
        },

        __merge:function (path, o1, o2) {
            //check for deleted values
            var o1Keys = Object.keys(o1), o2Keys = Object.keys(o2);
            o1Keys.sort();
            o2Keys.sort();
            if (!comb.deepEqual(o1Keys, o2Keys)) {
                o2Keys.forEach(function (k) {
                    if (o1Keys.indexOf(k) == -1) {
                        var newPath = path ? [path, k].join(".") : k;
                        delete o2[k];
                        this.emit(newPath, undefined);
                    }
                }, this);
            }
            o1Keys.forEach(function (j) {
                var fVal = o1[j], tVal = o2[j];
                if (!comb.deepEqual(fVal, tVal)) {
                    var newPath = path ? [path, j].join(".") : j;
                    if (comb.isHash(fVal)) {
                        if (comb.isHash(tVal)) {
                            this.__merge(newPath, fVal, tVal);
                        } else if (comb.isUndefinedOrNull(tVal)) {
                            var tVal = (o2[j] = {});
                            this.__merge(newPath, fVal, tVal);
                        } else {
                            o2[j] = fVal;
                        }
                    } else {
                        o2[j] = fVal;
                    }
                    this.emit(newPath, fVal);
                } else {
                    o2[j] = o1[j];
                }
            }, this);
            return this;
        },


        emit:function (name, value) {
            var listeners = this.__listeners;
            for (var i in listeners) {
                var listener = listeners[i]
                if (listener.match.test(name)) {
                    var lls = listener.listeners;
                    if (lls.length) {
                        //do this incase they remove a cb while calling listeners
                        for (var i in lls) {
                            (function (c) {
                                process.nextTick(function () {
                                    c(name, value)
                                });
                            })(lls[i])
                        }
                    }
                }
            }
        },

        __createMatcher:function (topic) {
            return new RegExp(["^",
                topic.replace(".", "\\.")
                    .replace(/\*/g, ".+")
                    .replace(/\{((?:\w+\|?)*)\}/ig, function (str, match) {
                        return "(?:" + match + ")";
                    }), "$"].join(""));
        },

        __mergeConfigs:function (configs) {
            var config = this.config, env = this.environment, newConfig = {};
            for (var i in configs) {
                this.loaded.push(i);
                var c = configs[i];
                if (env) {
                    c = c[env] || {};
                }
                comb.deepMerge(newConfig, c);
            }
            this.__merge("", newConfig, this.config);
            return config;
        },

        __mergeFiles:function () {
            var monitor = [], isHash = false, files = this.files.map(function (f) {
                if (comb.isHash(f)) {
                    isHash = true;
                    if (comb.isBoolean(f.monitor)) {
                        monitor.push(f.file);
                    }
                    return f.file;

                } else {
                    return f;
                }
            });
            var ret = this.__mergeConfigs(readFiles(files));
            this._monitor(isHash ? monitor : null, true);
            return ret;
        },

        removeListener:function (prop, cb) {
            if (comb.isFunction(prop)) {
                cb = prop;
                prop = "";
            }
            var listeners = this.__listeners;
            for (var i in listeners) {
                var listener = listeners[i]
                if (listener.match.test(prop)) {
                    var lls = listener.listeners;
                    var l = lls.length - 1;
                    for (; l >= 0; l--) {
                        if (lls[l].__cb === cb) {
                            lls.splice(l, 1);
                            break;
                        }
                    }
                }
            }
        },

        removeAllListeners:function (prop) {
            var listeners = this.__listeners;
            for (var i in listeners) {
                var listener = listeners[i]
                if (listener.match.test(prop)) {
                    listener.listeners.length = 0;
                }
            }
        },

        addListener:function (prop, cb) {
            if (comb.isFunction(prop)) {
                cb = prop;
                prop = "*";
            }
            var listener = this.__listeners[prop], listeners;
            if (!listener) {
                listener = (this.__listeners[prop] = {match:this.__createMatcher(prop)});
                listeners = (listener.listeners = []);
            } else {
                listeners = listener.listeners;
            }
            var l = cb.length;
            var wrapped = function (name, value) {
                if (l) {
                    var tConfig = comb.deepMerge({}, this.config);
                    if (l == 1) {
                        if (prop === "*") {
                            cb(this.config);
                        } else {
                            cb(value);
                        }
                    } else if (l == 2) {
                        if (prop == "*") {
                            cb(name, tConfig);
                        } else {
                            cb(name, value);
                        }
                    } else {
                        cb(name, value, tConfig)
                    }
                } else {
                    cb();
                }
            }.bind(this);
            wrapped.__cb = cb;
            listeners.push(wrapped);
            return this;
        },

        on:function () {
            return this.addListener.apply(this, arguments);
        },

        once:function (prop, cb) {
            if (comb.isFunction(prop)) {
                cb = prop;
                prop = "*";
            }
            //have to keep reference to self to maintain length;
            var self = this;
            return this.addListener(prop, function wrapped(a, b, c) {
                cb.apply(self, arguments);
                self.removeListener(prop, wrapped);
            });
        },

        load:function (cb) {
            var ret = new comb.Promise(),
                config = this.config;
            if (this.locations) {
                var loaded = this.loaded,
                    locations = this.locations,
                    l = locations.length, ignore = this.ignoreMissing,
                    monitor = this._monitor.bind(this),
                    mergeConfigs = this.__mergeConfigs.bind(this),
                    files = {};
                (function _load(index) {
                    if (index >= l) {
                        mergeConfigs(files);
                        monitor();
                        ret.callback(config);
                    } else {
                        var dir = locations[index];
                        getConfigs(dir, false).then(hitch(this, function (configs) {
                            comb.merge(files, configs);
                            _load(++index)
                        }), function (err) {
                            if (ignore) {
                                _load(++index)
                            } else {
                                console.warn(err.stack);
                                ret.errback(err);
                            }
                        });
                    }
                }.bind(this))(0);
            } else if (this.files) {
                ret.callback(this.__mergeFiles());
            } else {
                ret.callback({});
            }
            return ret.classic(cb);
        },

        loadSync:function () {
            if (this.locations) {
                var files = {};
                this.locations.forEach(function (dir) {
                    try {
                        comb.merge(files, getConfigs(dir, true))
                    } catch (e) {
                        if (!this.ignoreMissing) {
                            console.warn(e.stack);
                            throw e;
                        }
                    }
                }, this);
                this.__mergeConfigs(files);
                this._monitor();
            } else if (this.files) {
                this.__mergeFiles();
            }
            return this.config;
        }
    }
});

module.exports = exports = function (options) {
    var files = options.files, locations = options.locations;
    delete options.files;
    delete options.locations;
    return new Config(locations, files, options);
};
