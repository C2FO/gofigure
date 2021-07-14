/**
 * @projectName gofigure
 * @github http://github.com/C2FO/gofigure
 * @header [../README.md]
 * @includeDoc [Change Log] ../History.md
 */

const _ = require('lodash');
const PatternEventEmitter = require('./PatternEventEmitter');
const ConfigLocation = require('./ConfigLocation');
const merger = require('./processor/merger');

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
    this.config = {};

    /**
     * Set up our child locations. They manage the act of getting all of the
     * files in a given "location" and merging them together properly.
     * Our job here is to merge the already-resolved configs together in priority
     * order
     */
    this.locations = loaderConfig.locations.map((locationName) => new ConfigLocation(locationName, opts));
  }

  /**
   * Stops monitoring confgurations for changes.
   *
   * @return {Config} this config object.
   */
  stop() {
    this.locations.forEach((l) => l.stop());
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
    return Promise.all(this.locations.map((location) => location.load())).then((configs) => {
      return this.__postLoad(configs);
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
    return this.__postLoad(this.locations.map((location) => location.loadSync()));
  }

  __mergeConfigs(configs) {
    const mergedConfigs = configs.reduce((merged, source) => _.merge(merged, source), {});
    /**
     * We can't just use the `mergedConfigs` here because the `merger` manages our event
     * emitter.
     */
    return merger(this.config, mergedConfigs, { eventEmitter: this });
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
    this.locations.forEach((l) =>
      l.on('change', (path, config) => {
        /**
         * When one of our locations reports a change to their
         * config, merge it in.
         */
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
  const locations = (options.locations || [])
    .map((file) => {
      if (_.isPlainObject(file)) {
        return file;
      }
      return { file };
    })
    .reverse();
  if (!locations) {
    throw new Error('Please provide locations to load configurations from');
  }
  return new ConfigLoader({ locations }, options);
}

module.exports = gofigure;
