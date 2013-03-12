var fs = require("fs"),
    path = require("path"),
    _ = require("../lib/extended");

var conf1 = {
    "a": 1,
    "b": {
        "c": 1,
        "d": 2
    },
    "e": {
        "f": 3,
        "g": {
            "h": 4
        }
    }
};

var conf2 = {
    "b": {
        "c": 2
    },
    "i": {
        "j": 5,
        "k": 6
    },
    "l": 7
};

var envConf = {
    "development": {
        "a": 1,
        "b": {
            "c": 2,
            "d": 3
        },
        "e": {
            "f": 4,
            "g": {
                "h": 5
            }
        }
    },
    "production": {
        "a": 6,
        "b": {
            "c": 7,
            "d": 8
        },
        "e": {
            "f": 9,
            "g": {
                "h": 10
            }
        }
    },
    "test": {
        "a": 11,
        "b": {
            "c": 12,
            "d": 13
        },
        "e": {
            "f": 14,
            "g": {
                "h": 15
            }
        }
    }
};

var sharedEnvConf = {

    "*": {
        "a": 1,
        "b": 2
    },
    "development": {
        "b": 3,
        "c": 4
    },
    "test": {
        "b": 4
    },
    "production": {
        "c": 4
    }
};

var configs = {
    envConf: {config: envConf, file: path.resolve(__dirname, "configs/config-env/config.json")},
    sharedEnvConf: {config: sharedEnvConf, file: path.resolve(__dirname, "configs/config-shared-env/config.json")},
    conf1: {config: conf1, file: path.resolve(__dirname, "configs/configs1/config1.json")},
    conf2: {config: conf2, file: path.resolve(__dirname, "configs/configs2/config2.json")}
};

function createConfigs() {
    var config;
    for (var i in configs) {
        config = configs[i];
        fs.unlinkSync(config.file);
        fs.writeFileSync(config.file, JSON.stringify(config.config, null, 4));
    }
}

function updateConfig(config, update) {
    var currConfig = configs[config];
    if (currConfig) {
        fs.writeFileSync(
            currConfig.file,
            JSON.stringify(_.merge({}, currConfig.config, update), null, 4)
        );
    } else {
        throw new Error("Invalid config " + config);
    }
}

function allDeepMerge() {
    var ret = {};
    for (var i in configs) {
        _.deepMerge(ret, configs[i].config);
    }
    return ret;
}
exports.allDeepMerge = allDeepMerge;
exports.updateConfig = updateConfig;
exports.createConfigs = createConfigs;
exports.conf1 = conf1;
exports.conf2 = conf2;
exports.envConf = envConf;
exports.sharedEnvConf = sharedEnvConf;