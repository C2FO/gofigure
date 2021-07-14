/**
 * @projectName gofigure
 * @github http://github.com/C2FO/gofigure
 * @header [../README.md]
 * @includeDoc [Change Log] ../History.md
 */

const _ = require('lodash');
const PatternEventEmitter = require('./PatternEventEmitter');
const loader = require('./loader');
const processor = require('./processor');

class ConfigLocation extends PatternEventEmitter {
  /**
   * Aggregate class for a single entry in the `locations` array.
   *
   * Locations will load all the config files specified within their list
   * and then merge them together.
   */
  constructor(locationName, opts) {
    super({});
    if (!locationName) {
      throw new Error('A locationName is required');
    }
    const options = opts || {};
    this.environment = options.environment || process.env.NODE_ENV || null;
    this.nodeType = options.nodeType || process.env.NODE_TYPE || null;
    this.environmentVariables = options.environmentVariables || process.env || {};
    this.defaultEnvironment = options.defaultEnvironment || '*';
    this.config = {};
    this.monitor = !!options.monitor;
    this.locationName = locationName;
    this.loaded = false;
  }

  /**
   * Stops monitoring confgurations for changes.
   *
   * @return {Config} this config object.
   */
  stop() {
    this.__loaders.forEach((l) => l.unWatch());
    return this;
  }

  /**
   * Asynchronously loads configs.
   *
   * @example
   * configLoader.load().then((config) => {
   *     // use the config.
   * })
   *
   * @return {Promise<any>|Promise<any[] | never>} resolves with the merged configuration from all locations.s
   */
  load() {
    if (this.__loaded) {
      return Promise.resolve(this.config);
    }
    return loader.createLoadersAsync({ locations: [this.locationName] }, { monitor: this.monitor }).then((loaders) => {
      this.__loaders = loaders;
      const loads = loaders.map((l) => l.load());
      return Promise.all(loads).then((configs) => this.__postLoad(configs));
    });
  }

  /**
   * Synchronously loads configurations.
   *
   * @example
   * const config = configLoader.loadSync()
   * //use your config.
   *
   * @return {Object} the merged configuration from all locations.
   */
  loadSync() {
    if (this.__loaded) {
      return this.config;
    }
    this.__loaders = loader.createLoadersSync({ locations: [this.locationName] }, { monitor: this.monitor });
    return this.__postLoad(this.__loaders.map((l) => l.loadSync()));
  }

  __mergeConfigs(configs) {
    return processor(_.cloneDeep(this.config), configs, {
      environment: this.environment,
      defaultEnvironment: this.defaultEnvironment,
      nodeType: this.nodeType,
      eventEmitter: this,
      environmentVariables: this.environmentVariables,
    });
  }

  /**
   *  Merges configs and starts monitoring of configs if `monitor` is true.
   * @param configs {Array<Object>} an array of configurations to merge into a single object.
   * @return {Object} the merged config
   * @private
   */
  __postLoad(configs) {
    this.config = this.__mergeConfigs(configs);
    this.__listenToChanges();
    this.__loaded = true;
    return this.config;
  }

  __listenToChanges() {
    this.__loaders.forEach((l) =>
      l.on('change', (path, config) => {
        this.emit('change', this.__mergeConfigs([config]));
      }),
    );
  }
}

module.exports = ConfigLocation;
