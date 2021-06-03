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

class ConfigLoader extends PatternEventEmitter {
  /**
   * Aggregate class to load configurations from and merge into a single config.
   *
   *  @param loaderConfig a the configuration to pass to [loader}
   * @param [options.environment=process.env.NODE_ENV] the environment to use when loading configurations
   * @param [options.nodeType=process.env.NODE_TYPE] the node type to use when loading configurations
   * @param [options.environmentVariables=process.env] an object of environment variables to use
   * @param [options.defaultEnvironment='*'] the name of the default environment to use as a base to merge other
   * environments into
   * @param [options.monitor=false] the name of the default environment to use as a base to merge other environments
   * into.
   */
  constructor(loaderConfig, opts) {
    super({});
    if (!loaderConfig) {
      throw new Error('A loader configuration is required');
    }
    const options = opts || {};
    this.environment = options.environment || process.env.NODE_ENV || null;
    this.nodeType = options.nodeType || process.env.NODE_TYPE || null;
    this.environmentVariables = options.environmentVariables || process.env || {};
    this.defaultEnvironment = options.defaultEnvironment || '*';
    this.config = {};
    this.monitor = !!options.monitor;
    this.loaderConfig = loaderConfig;
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
    return loader.createLoadersAsync(this.loaderConfig, { monitor: this.monitor }).then((loaders) => {
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
    this.__loaders = loader.createLoadersSync(this.loaderConfig, { monitor: this.monitor });
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
        this.config = this.__mergeConfigs([config]);
      }),
    );
  }
}

/**
 * Factory method to create a new {@link ConfigLoader}.
 *
 * @example
 *
 * const loader = gofigure({locations: ["path/to/config.json"]})
 *
 * @example
 * const loader = gofigure({locations: ["path/to/config_dir"]})
 *
 * @param options {{locations: String|String}}
 * @param options.locations locations to load files from
 * @param [options.environment=process.env.NODE_ENV] the environment to use when loading configurations
 * @param [options.nodeType=process.env.NODE_TYPE] the node type to use when loading configurations
 * @param [options.environmentVariables=process.env] an object of environment variables to use
 * @param [options.defaultEnvironment='*'] the name of the default environment to use as a base to merge other
 * environments into
 * @param [options.monitor=false] the name of the default environment to use as a base to merge other environments into.
 * @return {ConfigLoader} the Config to use to load configurations.
 */
function gofigure(options = {}) {
  const locations = (options.locations || []).map((file) => {
    if (_.isPlainObject(file)) {
      return file;
    }
    return { file };
  });
  if (!locations) {
    throw new Error('Please provide either locations or etcd endpoints');
  }
  return new ConfigLoader({ locations }, options);
}

module.exports = gofigure;
