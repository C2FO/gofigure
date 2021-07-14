const _ = require('lodash');
const path = require('path');
const glob = require('glob');
const FileLoader = require('./FileLoader');
const helpers = require('../helpers');

const globP = helpers.denodeify(glob);

const createGlobPattern = (location) => {
  if (location === undefined) {
    return null;
  }
  if (/\.json$/.test(location)) {
    return location;
  }
  return path.resolve(location, '**/*.json');
};

const createLoader = (options) => {
  if (options.file) {
    return new FileLoader(options);
  }
  throw new Error('Unable to determine loader type please specify a file location');
};

const createLocationsFromGlobedFiles = (location, globedFiles) =>
  globedFiles.map((file) => _.merge({}, location, { file }));

const createLoadersSync = (locationName, options) => {
  const globPattern = createGlobPattern(locationName.file);
  const filesFromGlob = glob.sync(globPattern);
  const files = createLocationsFromGlobedFiles(locationName, filesFromGlob);
  return files.map((file) =>
    createLoader({
      ...options,
      ...file,
    }),
  );
};

const createLoadersAsync = (locationName, options) => {
  const globPattern = createGlobPattern(locationName.file);
  return globP(globPattern)
    .then((filesFromGlob) => createLocationsFromGlobedFiles(locationName, filesFromGlob))
    .then((files) =>
      files.map((file) =>
        createLoader({
          ...options,
          ...file,
        }),
      ),
    );
};

module.exports = {
  createLoadersSync,
  createLoadersAsync,
};
