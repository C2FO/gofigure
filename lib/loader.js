var _ = require("./extended"),
    EventEmitter = require("./events").EventEmitter,
    readFileP = _.wrap(_.readFile, _);

EventEmitter.extend({

    instance: {

        watching: false,

        watchTimeout: null,

        loaded: false,

        monitor: false,

        constructor: function (file, options) {
            options = options || {};
            if (_.isHash(file)) {
                options = _.merge({}, options, file);
                this.file = file.file;
            } else {
                this.file = file;
            }
            this.files = [];
            this.config = {};
            this.fileGlob = _.createGlobPattern(this.file);
            _.merge(this, options);
            _.bindAll(this, ["watch", "watchHandler", "emit"]);
        },

        watchHandler: function (event, file) {
            if (this.watching) {
                var emit = this.emit, config = this.config;
                if (event === "change") {
                    clearTimeout(this.watchTimeout);
                    //use a timeout incase the file changes again
                    this.watchTimeout = setTimeout(function () {
                        readFileP(file, "utf8").then(function (contents) {
                            emit("change", _.deepMerge(config, JSON.parse(contents)));
                        });
                    }, 10);
                }
            }
        },

        unWatch: function () {
            if (this.watching) {
                this.watching = false;
                clearTimeout(this.watchTimeout);
                this.files.forEach(function (file) {
                    _.unwatchFile(file, this.watchHandler);
                }, this);
            }
            return this;
        },

        watch: function () {
            if (!this.watching) {
                this.watching = true;
                this.files.forEach(function (file) {
                    _.watch(file, function (event) {
                        this.watchHandler(event, file);
                    }.bind(this));
                }, this);
            }
            return this;
        },

        loadSync: function () {
            if (!this.loaded) {
                var c = this.config = {};
                (this.files = _.glob.sync(this.fileGlob).sort()).map(function (file) {
                    try {
                        return JSON.parse(_.readFileSync(file, "utf8"));
                    } catch (e) {
                        throw new Error("Error parsing " + file + ": " + e.message);
                    }
                }).forEach(function (newC) {
                        _.deepMerge(c, newC);
                    });
                this.loaded = true;
                if (this.monitor) {
                    this.watch();
                }
            }
            return this.config;

        },

        load: function () {
            if (!this.loaded) {
                return _.wrap(_.glob, _)(this.fileGlob)
                    .then(function (files) {
                        this.files = files.sort();
                        return _.when(files.map(function (file) {
                            return readFileP(file, "utf8").then(function (contents) {
                                return JSON.parse(contents);
                            });
                        }));
                    }.bind(this))
                    .then(function (files) {
                        this.loaded = true;
                        var ret = (this.config = _.deepMerge.apply(_, [
                            {}
                        ].concat(files)));
                        if (this.monitor) {
                            this.watch();
                        }
                        return ret;
                    }.bind(this));
            } else {
                return _.resolve(this.config);
            }
        }
    }

}).as(module);