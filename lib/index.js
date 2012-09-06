/**
 * @projectName gofigure
 * @github http://github.com/C2FO/gofigure
 * @header
 * #gofigure
 *
 * Gofigure is a configuration tool for node to help in the gathering and monitoring of configuration files in node.
 *
 * # Installation
 *
 *     npm install gofigure
 *
 * #Usage
 *
 *
 *   * [Loading A Configuration](#load)
 *     * [Directories](#loadDir)
 *     * [Files](#loadFiles)
 *   * [Monitoring Property Changes](#monitoring)
 *     * [Monitoring All Files](#monitoringAll)
 *     * [Monitoring Certain Files](#monitoringSome)
 *     * [Property Topic Syntax](#monitoringSyntax)
 *     * [Property Change Callback](#monitoringCB)
 *   * [Environments](#environments)
 *
 * <a name="load"></a>
 * ##Loading configurations
 *
 * Gofigure currently handles the loading of JSON files for configurations.
 *
 * To Get an instance of a configuration object use the `gofigure` method. The `gofigure` method takes an object that accepts the following options
 *
 *   * [locations](#loadDir)  : an array of directories that contain your configurations.
 *   * [files](#loadFiles)  : an array of files that contain your configurations.
 *   * [monitor](#monitoring) : set to true to monitor changes to configuration files.
 *   * `ignoreMissing` : By default `gofigure` will ignore missing directories. Set this to false to precent the ignoring of missing configuration directories.
 *   * [environment](#environments) : By default will look for `process.env.NODE_ENV` if this is not set then gofigure will read all properties. If you wish to explicity set the environment then set this property.
 *
 * ```javascript
 *
 * var gofigure = require("gofigure");
 *
 * //Loader for directory of configurations
 * var dirLoader = gofigure({
 *   locations : [__dirname + "/configs"]
 * });
 *
 *
 * //Loader for files of configurations
 * var dirLoader = gofigure({
 *   files : [process.env.HOME + "/configs/config1.json", __dirname + "/config1.json"]
 * });
 *
 *
 * ```
 *
 * You can load configurations asynchronously
 *
 * ```javascript
 * loader.load(function(err, config){
 *     var PORT = config.port, HOST = config.host;
 * });
 * ```
 *
 * or synchronously
 *
 * ```javascript
 * var gofigure = require("gofigure");
 *
 * var loader = gofigure({locations : [__dirname + "/configs"]});
 * var config = loader.loadSync();
 * ```
 *
 * <a name="loadDir"></a>
 * ###Directories of configurations
 * To load directories that contain configuration files in the options object provide locations property that is an array of directories than contain your configurations.
 *
 * ```javascript
 *
 * var gofigure = require("gofigure");
 *
 * var loader = gofigure({locations : [__dirname + "/configs"]});
 * loader.load(function(err, config){
 *     var PORT = config.port, HOST = config.host;
 * });
 * ```
 *
 * The order of the locations matter as it defines a precedence for files. For example suppose you have a directory of default configuration files, and on production you want to override those configuration with environment specific configurations with out changing your module or source controlled files.
 *
 * ```javascript
 * var gofigure = require("gofigure");
 *
 * var loader = gofigure({locations : ["/prod/configs", __dirname + "/configs"]});
 * loader.load(function(err, config){
 *     var PORT = config.port, HOST = config.host;
 * });
 * ```
 *
 * Here any production configuration files found in `/prod/configs` will override the properties in `__dirname + "/configs"`.
 *
 * Another use case might be in development where you have default properties and instead of altering the source controlled files the developer can override them by putting them in their home directory.
 *
 * ```javascript
 * var gofigure = require("gofigure");
 * var HOME = process.env.HOME;
 *
 * var loader = gofigure({locations : [ HOME + "/yourApp/configs", __dirname + "/configs"]});
 * loader.load(function(err, config){
 *     var PORT = config.port, HOST = config.host;
 * });
 * ```
 *
 * <a name="loadFiles"></a>
 * ###Files
 *
 * You may also load specific files rather than entire directories.
 *
 * ```javascript
 * var gofigure = require("gofigure");
 *
 * var loader = gofigure({files : ["/prod/configs/config1.json", __dirname + "/config.json"]});
 * loader.load(function(err, config){
 *     var PORT = config.port, HOST = config.host;
 * });
 * ```
 *
 * Again order matters `/prod/configs/config1.json` will override `__dirname + "/config.json"`
 *
 * <a name="monitoring"></a>
 * ##Monitoring
 *
 * Gofigure supports the monitoring of changes to configuration files.
 *
 * <a name="monitoringAll"></a>
 * ###All files
 *
 * To enable monitoring you can specify monitor to true in the options.
 *
 * ```javascript
 * var gofigure = require("gofigure");
 *
 * var loader = gofigure({monitor : true, files : ["/prod/configs/config1.json", __dirname + "/config.json"]});
 * var config = loader.loadSync();
 *
 * loading.on("my.cool.property", function(newValue){
 *   //...do something
 * });
 * ```
 * <a name="monitoringSome"></a>
 * ###Individual Files
 *
 * To monitor certain files you can use the files property and with object that have a `monitor : true` KV pair.
 *
 * ```javascript
 * var gofigure = require("gofigure");
 *
 * var loader = gofigure({files : [
 *   {
 *     file : "/prod/configs/config1.json",
 *     monitor : true
 *
 *   },
 *   __dirname + "/config.json"
 * ]});
 * var config = loader.loadSync();
 *
 * loading.on("my.cool.property", function(newValue){
 *   //...do something
 * });
 * ```
 * Just `config1.json` will be monitored for changes.
 *
 * <a name="monitoringSyntax"></a>
 * ###Property topic syntax
 *
 * To listen to all properties
 *
 * ```javascript
 * loading.on(function(config){
 *   //...do something
 * });
 *
 * loading.on(function(nameOfPropertyChanged, config){
 *   //...do something
 * });
 *
 * loading.on(function(nameOfPropertyChanged, value, config){
 *   //...do something
 * });
 * ```
 *
 * To listen to specific properties
 *
 * ```javascript
 * loading.on("my.cool.property", function(newValue){
 *   //...do something
 * });
 *
 * loading.on("my.cool.property", function(newValue, config){
 *   //...do something
 * });
 *
 * loading.on("my.cool.property", function(nameOfPropertyChanged, value, config){
 *   //...do something
 * });
 * ```
 *
 * Wild cards
 *
 * ```javascript
 *
 * //listen to any property changed on the my.cool object
 * loading.on("my.cool.*", function(propName, newValue){
 *   //...do something
 * });
 *
 *
 * //listen to the change of a property named 'property' on any object
 * //that is a member of my
 * loading.on("my.*.property", function(propName, newValue){
 *   //...do something
 * });
 *
 * //listen to the change of a property named 'property' that is
 * //a member of a property called cool
 * loading.on("*.cool.property", function(propName, newValue){
 *   //...do something
 * });
 *
 * //listen to the change of property or otherProperty on the my.cool object.
 * loading.on("my.cool.{property|otherProperty}", function(propName, newValue){
 *   //...do something
 * });
 *
 * //listen to the change of property or otherProperty on the my cool or
 * //notCool object.
 * loading.on("my.{cool|notCool}.{property|otherProperty}", function(propName, newValue){
 *   //...do something
 * });
 * ```
 *
 * <a name="monitoringCB"></a>
 * ###Callback Arguments
 *
 *
 * The property change callback will pass in the following values depending on the arity of the callback.
 *
 * If 1 argument is expected then just the callback invoked with the new value is a.
 *
 * ```javascript
 *
 * loading.on("my.cool.property", function(newValue){
 *   //...do something
 * });
 *
 *
 * ```
 *
 * If two arguments are expected then it is invoked with the property name and the new value.
 *
 *
 * ```javascript
 *
 * loading.on("my.cool.property", function(propName, newValue){
 *   //...do something
 * });
 *
 *
 * ```
 *
 * Other wise the callback is invoked with the propertyName, newValue and the configuration object.
 *
 * ```javascript
 *
 * loading.on("my.cool.property", function(propName, newValue, configObject){
 *   //...do something
 * });
 *
 *
 * ```
 *
 * <a name="environments"></a>
 * ##Environments
 *
 * `gofigure` also supports environments, by default it will look for `NODE_ENV` and if it is set then it will use it.
 *
 * The following is an example configuration file
 *
 * ```javascript
 *
 * {
 *     "development": {
 *         "logging":{
 *   	        "patio":{
 * 			        "level":"DEBUG",
 * 			        "appenders":[
 * 				        {
 * 					        "type":"RollingFileAppender",
 * 					        "file":"/var/log/myApp/patio.log"
 * 				        },
 * 				        {
 * 					        "type":"ConsoleAppender"
 * 				        }
 * 			        ]
 * 		        }
 *         },
 *         "app" : {
 *           "host" : "localhost",
 *           "port" : "8088"
 *         },
 *         "MYSQL_DB" : "mysql://test:testpass@localhost:3306/dev_db",
 *         "MONGO_DB" : "mongodb://test:testpass@localhost:27017/dev_db"
 *     },
 *     "production": {
 *         "logging":{
 *             "patio":{
 * 			        "level":"ERROR",
 * 			        "appenders":[
 * 				        {
 * 					        "type":"RollingFileAppender",
 * 					        "file":"/var/log/myApp/patio.log"
 * 				        }
 * 			        ]
 * 		        }
 *         },
 *         "app" : {
 *           "host" : "prod.mydomain.com",
 *           "port" : "80"
 *         },
 *         "MYSQL_DB" : "mysql://test:testpass@prod.mydomain.com:3306/prod_db",
 *         "MONGO_DB" : "mongodb://test:testpass@prod.mydomain.com:27017/prd_db"
 *     },
 *     "test": {
 *         "logging":{
 *             "patio":{
 * 			        "level":"INFO",
 * 			        "appenders":[
 * 				        {
 * 					        "type":"RollingFileAppender",
 * 					        "file":"/var/log/myApp/patio.log"
 * 				        }
 * 			        ]
 * 		        }
 *         },
 *         "app" : {
 *           "host" : "test.mydomain.com",
 *           "port" : "80"
 *         },
 *         "MYSQL_DB" : "mysql://test:testpass@test.mydomain.com:3306/test_db",
 *         "MONGO_DB" : "mongodb://test:testpass@test.mydomain.com:27017/test_db"
 *     }
 * }
 *
 * ```
 *
 * To load just the development properties set the `environment` to development.
 *
 * ```javascript
 *
 * var gofigure = require("gofigure"),
 *     patio = require("patio"),
 *     mongoose = require("mongoose"),
 *     comb = require("comb"),
 *     DB, HOST, PORT;
 *
 *
 * var loader = gofigure({
 *   files : [__dirname + "/config-env.json"],
 *   environment : "development"
 * })
 *   .on("MYSQL_DB", function(uri){
 *     patio.connect(uri);
 *   })
 *   .on("MONGO_DB", function(uri){
 *     mongoose.connect(uri);
 *   })
 *   .on("logging", function(logging){
 *     new comb.logging.PropertyConfigurator().configure(logging);
 *     patio.configureLogging(logging);
 *   })
 *   .on("app", function(app){
 *     //...
 *   })
 *   .load(function(){
 *     //do something
 *   })
 *
 * ```
 *
 * @footer
 * License
 * -------
 *
 * MIT <https://github.com/C2FO/gofigure/raw/master/LICENSE>
 *
 * Meta
 * ----
 *
 * * Code: `git clone git://github.com/c2fo/gofigure.git`
 * * Website:  <http://c2fo.com> - Twitter: <http://twitter.com/c2fo> - 877.465.4045
 *
 */
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
            var listeners = (watchedFiles[file] = []), timeout;
            fs.watch(file, function (event, filename) {
                if (event === "change") {
                    clearTimeout(timeout);
                    delete require.cache[file];
                    timeout = setTimeout(function () {
                        listeners.forEach(function (cb) {
                            process.nextTick(partial(cb, file));
                        });

                    }, 10);
                }

            });
        }
        watchedFiles[file].push(cb);
    });
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
