process.env.NODE_ENV = "";
var it = require("it"),
    _ = require("../lib/extended"),
    assert = require("assert"),
    path = require("path"),
    helper = require("./helper"),
    Loader = require("../index").Loader;


it.describe("gofigure.Loader", function (it) {

    it.should("accept and set a file", function () {
        var loader = new Loader(path.resolve(__dirname, "./configs/configs1/config1.json"));
        assert.equal(loader.file, path.resolve(__dirname, "./configs/configs1/config1.json"));
        assert.equal(loader.fileGlob, path.resolve(__dirname, "./configs/configs1/config1.json"));
    });

    it.should("accept and set a directory", function () {
        var loader = new Loader(path.resolve(__dirname, "./configs"));
        assert.equal(loader.file, path.resolve(__dirname, "./configs"));
        assert.equal(loader.fileGlob, path.resolve(__dirname, "./configs/**/*.json"));
    });

    it.should("properly configure directories with an ending slash", function () {
        var loader = new Loader(path.resolve(__dirname, "./configs/"));
        assert.equal(loader.file, path.resolve(__dirname, "./configs/"));
        assert.equal(loader.fileGlob, path.resolve(__dirname, "./configs/**/*.json"));
    });

    it.should("properly configure directories without an ending slash", function () {
        var loader = new Loader(path.resolve(__dirname, "./configs"));
        assert.equal(loader.file, path.resolve(__dirname, "./configs"));
        assert.equal(loader.fileGlob, path.resolve(__dirname, "./configs/**/*.json"));
    });

    it.should("properly configure the etcd endpoint", function () {
        var loader = new Loader({endpoints: ["127.0.0.1:4001"], root: "/gruntit"});
        assert.equal(loader.endpoints[0], ["127.0.0.1:4001"][0]);
        assert.equal(loader.root, "/gruntit");
    });


    it.beforeEach(function () {
        helper.createConfigs();
    });

    it.afterEach(function () {
        helper.createConfigs();
    });

    it.describe("#loadSync", function (it) {

        it.should("load a file", function () {
            var loader = new Loader(path.resolve(__dirname, "./configs/configs1/config1.json"));
            assert.deepEqual(loader.loadSync(), helper.conf1);
            assert.deepEqual(loader.config, helper.conf1);
        });

        it.should("load a directory", function () {
            var loader = new Loader(path.resolve(__dirname, "./configs"));
            //console.log(JSON.stringify(loader.loadSync(), null, 4));
            assert.deepEqual(loader.loadSync(), helper.allDeepMerge());
            assert.deepEqual(loader.config, helper.allDeepMerge());
        });

        /* it.should("load from etcd", function () {
            var loader = new Loader({endpoints: ["192.168.1.10:4001"], root: "/gruntit"});
            assert.deepEqual(loader.loadSync(), helper.sharedEnvConf);
            assert.deepEqual(loader.config, helper.sharedEnvConf);
        }); */

    });

    it.describe("#load", function (it) {
        it.should("load a file asynchronously", function () {
            var loader = new Loader(path.resolve(__dirname, "./configs/configs1/config1.json"));
            return loader.load().then(function (conf) {
                assert.deepEqual(conf, helper.conf1);
                assert.deepEqual(loader.config, helper.conf1);
            });
        });

        it.should("load a directory asynchronously", function () {
            var loader = new Loader(path.resolve(__dirname, "./configs"));
            return loader.load().then(function (conf) {
                assert.deepEqual(conf, helper.allDeepMerge());
                assert.deepEqual(loader.config, helper.allDeepMerge());
            });
        });

        /* it.should("load from etcd asynchronously", function () {
            var loader = new Loader({endpoints: ["127.0.0.1:4001"], root: "/gruntit"});
            return loader.load().then(function (conf) {
                assert.deepEqual(conf, helper.sharedEnvConf);
                assert.deepEqual(loader.config, helper.sharedEnvConf);
            });
        }); */

    });

    it.describe("#watch", function (it) {
        it.timeout(5000);

        it.should("watch a file for changes", function (next) {
            var loader = new Loader(path.resolve(__dirname, "./configs/configs1/config1.json"));
            assert.deepEqual(loader.loadSync(), helper.conf1);

            loader.watch().on("change", function (conf) {
                assert.deepEqual(conf, _.merge({}, helper.conf1, {a: 2}));
                loader.unWatch();
                next();
            });
            process.nextTick(function () {
                helper.updateConfig("conf1", {a: 2});
            });


        });

        it.should("watch a file for changes in a directory", function (next) {
            var loader = new Loader(path.resolve(__dirname, "./configs"));
            assert.deepEqual(loader.loadSync(), helper.allDeepMerge());

            loader.watch().on("change", function (conf) {
                assert.deepEqual(conf, _.deepMerge({}, helper.allDeepMerge(), helper.conf1, {a: 2}));
                loader.unWatch();
                next();
            });
            setTimeout(function () {
                helper.updateConfig("conf1", {a: 2});
            });


        });
    });


});

