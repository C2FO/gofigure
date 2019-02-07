'use strict';

const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');

class Listener {
    static createMatcher(propPattern) {
        return new RegExp([ '^',
            propPattern.replace('.', '\\.')
                .replace(/\*/g, '.+')
                .replace(/\{((?:\w+\|?)*)\}/ig, (str, match) => {
                    return `(?:${match})`;
                }), '$' ].join(''));
    }

    constructor(propPattern, config) {
        this.propPattern = Listener.createMatcher(propPattern);
        this.config = config;
        this.listeners = [];
    }

    isMatch(otherPropPattern) {
        return this.propPattern.test(otherPropPattern);
    }

    callIfMatch(prop, value) {
        if (this.isMatch(prop)) {
            this.listeners.forEach(l => l(prop, value));
        }
    }

    clearListeners() {
        this.listeners = [];
    }

    removeListener(listenerCb) {
        this.listeners = this.listeners.filter(cb => cb.__cb !== listenerCb);
    }

    addListenerCallback(listenerCb) {
        const wrapped = (name, value) => {
            if (this.propPattern === '*') {
                return listenerCb(name, _.cloneDeep({}, this.config));
            }
            return listenerCb(name, value);
        };
        wrapped.__cb = listenerCb;
        this.listeners = [ ...this.listeners, wrapped ];
        return null;
    }
}

class PatternEventEmitter extends EventEmitter {
    constructor(config) {
        super();
        this.__config = config;
        this.__listeners = new Map();
    }

    get config() {
        return this.__config;
    }

    set config(config) {
        this.__config = config;
        [ ...this.__listeners.values() ].forEach((l) => {
            l.config = config;
        });
        return config;
    }

    _findListeners(propPattern) {
        return [ ...this.__listeners.values() ].filter(l => l.isMatch(propPattern));
    }


    removeListener(propPath, cb) {
        let propPattern = propPath;
        let listenerCb = cb;
        if (_.isFunction(propPattern)) {
            listenerCb = propPattern;
            propPattern = '';
        }
        this._findListeners(propPattern).forEach(l => l.removeListener(listenerCb));
    }

    removeAllListeners(prop) {
        this._findListeners(prop).forEach(l => l.clearListeners());
    }

    addListener(prop, cb) {
        let propPattern = prop;
        let listenerCb = cb;
        if (_.isFunction(propPattern)) {
            listenerCb = propPattern;
            propPattern = '*';
        }
        let listener = this.__listeners.get(propPattern);
        if (!listener) {
            listener = new Listener(propPattern, this.config);
            this.__listeners.set(propPattern, listener);
        }
        listener.addListenerCallback(listenerCb);
        return this;
    }

    on() {
        return this.addListener.apply(this, arguments);
    }

    once(prop, cb) {
        let propPattern = prop;
        let listenerCb = cb;
        if (_.isFunction(propPattern)) {
            listenerCb = propPattern;
            propPattern = '*';
        }
        // have to keep reference to self to maintain length;
        const wrapped = (a, b, c) => {
            listenerCb(a, b, c);
            this.removeListener(prop, wrapped);
        };
        return this.addListener(propPattern, wrapped);
    }

    emit(name, value) {
        [ ...this.__listeners.values() ].forEach(l => l.callIfMatch(name, value));
        return true;
    }

    _emit(f, name, value) {
        setImmediate(() => f(name, value));
    }
}

module.exports = PatternEventEmitter;
