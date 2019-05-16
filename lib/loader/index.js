'use strict';

const _ = require('lodash');
const path = require('path');
const glob = require('glob');
const EtcdLoader = require('./EtcdLoader');
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
    if (options.etcd) {
        return new EtcdLoader(options);
    }
    if (options.file) {
        return new FileLoader(options);
    }
    throw new Error('Unable to determine loader type please specify either an Etcd configuration or file location');
};

const normalizeLocations = (locations, options) => locations
    .map(location => _.merge({}, options, (_.isString(location) ? { file: location } : location)));

const createLocationsFromGlobedFiles = (location, globedFiles) => {
    return globedFiles.map(file => _.merge({}, location, { file }));
};

const createLoadersSync = (loaderConfig, options) => {
    let loaders = [];
    if (loaderConfig.locations) {
        const files = normalizeLocations(loaderConfig.locations, options)
            .reduce((globedFiles, location) => {
                const globPattern = createGlobPattern(location.file);
                const filesFromGlob = glob.sync(globPattern);
                return [ ...globedFiles, ...createLocationsFromGlobedFiles(location, filesFromGlob) ];
            }, []);
        loaders = files.map(location => createLoader(location));
    }
    if (loaderConfig.etcd) {
        loaders.push(createLoader(_.merge({}, options, loaderConfig)));
    }
    return loaders;
};

const createLoadersAsync = (loaderConfig, options) => {
    let loadersPromise = Promise.resolve([]);
    if (loaderConfig.locations) {
        const globFilesPromise = normalizeLocations(loaderConfig.locations, options)
            .reduce((globedFilesPromise, location) => {
                return globedFilesPromise.then((globedFiles) => {
                    const globPattern = createGlobPattern(location.file);
                    return globP(globPattern).then((filesFromGlob) => {
                        return [
                            ...globedFiles,
                            ...createLocationsFromGlobedFiles(location, filesFromGlob),
                        ];
                    });
                });
            }, Promise.resolve([]));
        loadersPromise = globFilesPromise.then(files => files.map(location => createLoader(location)));
    }
    if (loaderConfig.etcd) {
        loadersPromise = loadersPromise
            .then(loaders => [ ...loaders, createLoader(_.merge({}, options, loaderConfig)) ]);
    }
    return loadersPromise;
};

module.exports = {
    createLoadersSync,
    createLoadersAsync,
};
