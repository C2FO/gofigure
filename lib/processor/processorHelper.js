const _ = require('lodash');

const getFlattenedObject = (obj) => {
  const traverse = (currentPath, objToTraverse) =>
    Object.keys(objToTraverse).reduce((keyMap, key) => {
      const val = objToTraverse[key];
      const propPath = currentPath ? [currentPath, key].join('.') : key;
      if (!_.isPlainObject(val) || _.isEmpty(val)) {
        return Object.assign(keyMap, { [propPath]: val });
      }
      return _.merge(keyMap, traverse(propPath, val));
    }, {});

  return traverse(null, obj);
};

module.exports = {
  getFlattenedObject,
};
