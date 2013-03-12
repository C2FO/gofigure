var EM = require("events").EventEmitter,
    _ = require("./extended");

var EventEmitter = _.declare({
    instance: EM.prototype,
    "static": _.merge({
        eventInited: false,
        init: function () {
            if (!this.eventInited) {
                this.eventInited = true;
                EM.call(this);
            }
        }
    }, EM.prototype)
}).as(exports, "EventEmitter");

EventEmitter.extend({
    instance: {

        constructor: function () {
            this._super(arguments);
            this.__listeners = {};
        },

        removeListener: function (prop, cb) {
            if (_.isFunction(prop)) {
                cb = prop;
                prop = "";
            }
            _.hash.forEach(this.__listeners, function (listener) {
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
            });
        },

        removeAllListeners: function (prop) {
            _.hash.forEach(this.__listeners, function (listener) {
                if (listener.match.test(prop)) {
                    listener.listeners.length = 0;
                }
            });
        },

        addListener: function (prop, cb) {
            if (_.isFunction(prop)) {
                cb = prop;
                prop = "*";
            }
            var listener = this.__listeners[prop], listeners;
            if (!listener) {
                listener = (this.__listeners[prop] = {match: this.__createMatcher(prop)});
                listeners = (listener.listeners = []);
            } else {
                listeners = listener.listeners;
            }
            var l = cb.length;
            var wrapped = function (name, value) {
                if (l) {
                    var tConfig = _.deepMerge({}, this.config);
                    if (l === 1) {
                        if (prop === "*") {
                            cb(this.config);
                        } else {
                            cb(value);
                        }
                    } else if (l === 2) {
                        if (prop === "*") {
                            cb(name, tConfig);
                        } else {
                            cb(name, value);
                        }
                    } else {
                        cb(name, value, tConfig);
                    }
                } else {
                    cb();
                }
            }.bind(this);
            wrapped.__cb = cb;
            listeners.push(wrapped);
            return this;
        },

        on: function () {
            return this.addListener.apply(this, arguments);
        },

        once: function (prop, cb) {
            if (_.isFunction(prop)) {
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

        _emit: function (f, name, value) {
            process.nextTick(function () {
                f(name, value);
            });
        },


        emit: function (name, value) {
            _.hash.forEach(this.__listeners, function (listener) {
                if (listener.match.test(name)) {
                    var lls = listener.listeners;
                    if (lls.length) {
                        for (var i = 0, l = lls.length; i < l; i++) {
                            this._emit(lls[i], name, value);
                        }
                    }
                }
            }, this);
        },

        __createMatcher: function (topic) {
            return new RegExp(["^",
                topic.replace(".", "\\.")
                    .replace(/\*/g, ".+")
                    .replace(/\{((?:\w+\|?)*)\}/ig, function (str, match) {
                        return "(?:" + match + ")";
                    }), "$"].join(""));
        }
    }
}).as(exports, "PatternEventEmitter");