'use strict';

const assert = require('assert');
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const merger = require('../../lib/processor/merger');

describe('processor merger', () => {
    it('should return a new config with the updated values', () => {
        const eventEmitter = new EventEmitter();
        const newConfig = {
            a: {
                b: {
                    c: 'a',
                },
            },
            d: 1,
        };
        const oldConfig = {};
        const merged = merger(oldConfig, newConfig, eventEmitter);
        assert.deepStrictEqual(merged, newConfig);
        assert.deepStrictEqual(oldConfig, {});
    });

    it('should not include keys that do not exist in the new config', () => {
        const eventEmitter = new EventEmitter();
        const newConfig = {
            a: {
                b: {
                    c: 'a',
                },
            },
            d: 1,
        };
        const oldConfig = _.merge({}, newConfig, { e: 3 });
        const merged = merger(oldConfig, newConfig, eventEmitter);
        assert.deepStrictEqual(merged, newConfig);
    });

    it('should emit for removed keys', () => {
        const eventEmitter = new EventEmitter();
        const events = [];
        eventEmitter.emit = (prop, value) => events.push({ prop, value });
        const newConfig = {
            a: {
                b: {
                    c: 'a',
                },
            },
            d: 1,
        };
        const oldConfig = _.merge({}, newConfig, { e: 3 });
        const merged = merger(oldConfig, newConfig, { eventEmitter });
        assert.deepStrictEqual(merged, newConfig);
        assert.deepStrictEqual(events, [
            { prop: 'e', value: undefined },
        ]);
    });

    it('should emit for added keys', () => {
        const eventEmitter = new EventEmitter();
        const events = [];
        eventEmitter.emit = (prop, value) => events.push({ prop, value });
        const newConfig = {
            a: {
                b: {
                    c: 'a',
                },
            },
            d: 1,
        };
        const merged = merger({}, newConfig, { eventEmitter });
        assert.deepStrictEqual(merged, newConfig);
        assert.deepStrictEqual(events, [
            { prop: 'a', value: { b: { c: 'a' } } },
            { prop: 'a.b', value: { c: 'a' } },
            { prop: 'a.b.c', value: 'a' },
            { prop: 'd', value: 1 },
        ]);
    });
});
