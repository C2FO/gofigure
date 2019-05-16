'use strict';

const _ = require('lodash');


const getFlattenedObject = (obj) => {
    const traverse = (currentPath, objToTraverse) => {
        return Object.keys(objToTraverse).reduce((keyMap, key) => {
            const val = objToTraverse[key];
            const propPath = currentPath ? [ currentPath, key ].join('.') : key;
            if (!_.isPlainObject(val) || _.isEmpty(val)) {
                keyMap[propPath] = val;
                return keyMap;
            }
            return _.merge(keyMap, traverse(propPath, val));
        }, {});
    };

    return traverse(null, obj);
};

module.exports = {
    getFlattenedObject,
};
