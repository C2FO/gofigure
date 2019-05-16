'use strict';

const _ = require('lodash');
const processorHelper = require('./processorHelper');

const getFlattenedObject = processorHelper.getFlattenedObject;

const _emitChanges = (config, deletedKeys, changedKeyValues, eventEmitter) => {
    const changedObjects = changedKeyValues.map(kv => kv.key)
        .reduce((changed, key) => {
            // split the key
            const keyParts = key.split('.');
            // if its a single path just return the orginal
            if (keyParts.length <= 1) {
                return changed;
            }
            // create all parent key paths so we can emit changes for not only the original changed
            // key but the parent key paths also
            const objectKeys = keyParts.slice(0, keyParts.length - 1).reduce((paths, keyPath) => {
                if (!paths.length) {
                    // if its the first part of the key just initialize it
                    return [ keyPath ];
                }
                // return the paths array plus the new key path
                return [ ...paths, `${_.last(paths)}.${keyPath}` ];
            }, []);
            return _.uniq([ ...changed, ...objectKeys ]);
        }, [])
        .map(key => ({ key, value: _.get(config, key) }));
    // emit for each deleted key
    deletedKeys.forEach(key => eventEmitter.emit(key, undefined));
    // get all changes unique by the path and sort by the path
    const allChanges = _.sortBy(_.unique([ ...changedKeyValues, ...changedObjects ], 'key'), 'key');
    // emit the events
    allChanges.forEach(kv => eventEmitter.emit(kv.key, kv.value));
};

const _merge = (path, oldConfig, sourceConfig, opts) => {
    const options = opts || {};
    const eventEmitter = options.eventEmitter;
    // check for deleted values
    const oldKeyMap = getFlattenedObject(oldConfig);
    const oldKeyMapKeys = Object.keys(oldKeyMap).sort();
    const sourceKeyMap = getFlattenedObject(sourceConfig);
    const sourceKeyMapKeys = Object.keys(sourceKeyMap).sort();
    const deletedKeys = _.difference(oldKeyMapKeys, sourceKeyMapKeys);
    const changedKeys = [];
    const mergedConfig = sourceKeyMapKeys.reduce((config, key) => {
        const oldValue = oldKeyMap[key];
        const newValue = sourceKeyMap[key];
        if (!_.isEqual(oldValue, newValue)) {
            changedKeys.push({ key, value: newValue });
        }
        _.set(config, key, newValue);
        return config;
    }, {});
    if (eventEmitter) {
        _emitChanges(mergedConfig, deletedKeys, changedKeys, eventEmitter);
    }
    return mergedConfig;
};

const merger = (oldConfig, newConfig, eventEmitter) => _merge('', _.cloneDeep(oldConfig), _.cloneDeep(newConfig), eventEmitter);

module.exports = merger;
