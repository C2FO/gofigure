var _ = require("extended")()
    .register(require("is-extended"))
    .register(require("object-extended"))
    .register(require("array-extended"))
    .register(require("promise-extended"))
    .register(require("function-extended"))
    .register("declare", require("declare.js"))
    .register("glob", require("glob"))
    .register(require("path"))
    .register(require("fs"));

function createGlobPattern(file) {
    if (/\.json$/.test(file)) {
        return file;
    } else {
        return _.resolve(file, "**/*.json");
    }
}

_.register("createGlobPattern", createGlobPattern);

module.exports = _;