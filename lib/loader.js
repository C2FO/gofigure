var _ = require("./extended"),
    EventEmitter = require("./events").EventEmitter,
    readFileP = _.wrap(_.readFile, _)
    Etcd = require("node-etcd");

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
            if (this.endpoints) {
                this.etcd = this.ssloptions ? 
                    new Etcd(this.endpoints, this.ssloptions) : 
                    new Etcd(this.endpoints);
            }
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
                if(this.fileGlob !== undefined) { //Process files
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
                } else if(this.endpoints) { //Process etcd
                    var etcdresp = this.etcd.getSync(this.root + "/environment", { recursive: true });
                    var basePath = this.root + "/environment";
                    var keyRegex = new RegExp(basePath + "/(.*)");
                    this.__processNodes(etcdresp.body.node.nodes, keyRegex, c);
                    this.loaded = true;
                }
            }
            return this.config;

        },

        load: function () {
            if (!this.loaded) {
                if (this.fileGlob !== undefined) {
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
                }
            } else {
                return _.resolve(this.config);
            }
        },

        __processNodes: function(nodes, regex, cfg){
            for(var i = 0; i < nodes.length; i++){
                if(nodes[i].dir){
                    var newCfg = {};
                    var emptyObject = regex.exec(nodes[i].key);
                    if(emptyObject.length < 2){
                        continue;
                    }
                    var emptyObjectLocation = emptyObject[1];
                    var emptyObjectPath = emptyObjectLocation.split("/");
                    var emptyObjectName = emptyObjectPath[emptyObjectPath.length - 1].replace(/\+/g, " ");
                    cfg[emptyObjectName] = newCfg;
                    if(nodes[i].nodes !== undefined){
                        this.__processNodes(nodes[i].nodes, regex, newCfg);
                    }
                } else {
                    var parsedKey = regex.exec(nodes[i].key);
                    var keyLocation = parsedKey[1];
                    objNames = keyLocation.split("/");
                    var valueName = objNames[objNames.length - 1].replace(/\+/g, " ");
                    cfg[valueName] = JSON.parse(nodes[i].value);
                }
            }
        }
    }

}).as(module);