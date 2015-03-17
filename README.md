[![Build Status](https://travis-ci.org/C2FO/gofigure.png)](https://travis-ci.org/C2FO/gofigure)

# gofigure

Gofigure is a configuration tool for node to help in the gathering and monitoring of configuration files in node.

# Installation

For nodejs >= 0.10 and iojs:

```
$ npm install gofigure
```

For nodejs < 0.10:

```
$ npm install gofigure@0.1.2
```

# Usage


  * [Loading A Configuration](#load)
    * [Directories](#loadDir)
    * [Files](#loadFiles)
    * [Etcd](#loadEtcd)
  * [Monitoring Property Changes](#monitoring)
    * [Monitoring All Files](#monitoringAll)
    * [Monitoring Certain Files](#monitoringSome)
    * [Property Topic Syntax](#monitoringSyntax)
    * [Property Change Callback](#monitoringCB)
  * [Environments](#environments)
  * [Node Type](#type)

<a name="load"></a>
## Loading configurations

Gofigure currently handles the loading of JSON files for configurations.

To Get an instance of a configuration object use the `gofigure` method. The `gofigure` method takes an object that accepts the following options

  * [locations](#loadDir)  : an array of directories or [an Etcd server definition](#loadEtcd) that contain your configurations.
  * [files](#loadFiles)  : an array of files that contain your configurations.
  * [monitor](#monitoring) : set to true to monitor changes to configuration files.
  * `ignoreMissing` : By default `gofigure` will ignore missing directories. Set this to false to precent the ignoring of missing configuration directories.
  * [environment](#environments) : By default will look for `process.env.NODE_ENV` if this is not set then gofigure will read all properties. If you wish to explicity set the environment then set this property.
  * `defaultEnvironment` [`*`]: The key that represents default values to be set when an environment is used.

```javascript

var gofigure = require("gofigure");

//Loader for directory of configurations
var dirLoader = gofigure({
  locations : [__dirname + "/configs"]
});


//Loader for files of configurations
var dirLoader = gofigure({
  files : [process.env.HOME + "/configs/config1.json", __dirname + "/config1.json"]
});


```

You can load configurations asynchronously

```javascript
loader.load(function(err, config){
    var PORT = config.port, HOST = config.host;
});
```

or synchronously

```javascript
var gofigure = require("gofigure");

var loader = gofigure({locations : [__dirname + "/configs"]});
var config = loader.loadSync();
```

<a name="loadDir"></a>
### Directories of configurations
To load directories that contain configuration files in the options object provide locations property that is an array of directories than contain your configurations.

```javascript

var gofigure = require("gofigure");

var loader = gofigure({locations : [__dirname + "/configs"]});
loader.load(function(err, config){
    var PORT = config.port, HOST = config.host;
});
```

The order of the locations matter as it defines a precedence for files. For example suppose you have a directory of default configuration files, and on production you want to override those configuration with environment specific configurations with out changing your module or source controlled files.

```javascript
var gofigure = require("gofigure");

var loader = gofigure({locations : ["/prod/configs", __dirname + "/configs"]});
loader.load(function(err, config){
    var PORT = config.port, HOST = config.host;
});
```

Here any production configuration files found in `/prod/configs` will override the properties in `__dirname + "/configs"`.

Another use case might be in development where you have default properties and instead of altering the source controlled files the developer can override them by putting them in their home directory.

```javascript
var gofigure = require("gofigure");
var HOME = process.env.HOME;

var loader = gofigure({locations : [ HOME + "/yourApp/configs", __dirname + "/configs"]});
loader.load(function(err, config){
    var PORT = config.port, HOST = config.host;
});
```

<a name="loadFiles"></a>
### Files

You may also load specific files rather than entire directories.

```javascript
var gofigure = require("gofigure");

var loader = gofigure({files : ["/prod/configs/config1.json", __dirname + "/config.json"]});
loader.load(function(err, config){
    var PORT = config.port, HOST = config.host;
});
```

Again order matters `/prod/configs/config1.json` will override `__dirname + "/config.json"`

<a name="loadEtcd"></a>
### Etcd

You may also load from a centralized Etcd server.

```javascript
var gofigure = require("gofigure");

var ETCD_CONFIG = {endpoints: ["127.0.0.1:4001"], root: "/appname"};

var loader = gofigure({locations : [ETCD_CONFIG]});
loader.load(function(err, config){
    var PORT = config.port, HOST = config.host;
});
```

Synchronous loading from Etcd is also supported.

```javascript
var gofigure = require("gofigure");

var ETCD_CONFIG = {endpoints: ["127.0.0.1:4001"], root: "/appname"};

var loader = gofigure({locations : [ETCD_CONFIG]});
var config = loader.loadSync();
var PORT = config.port, HOST = config.host;
```

If your Etcd server requires SSL/TLS and specific certificates, ssloptions can be passed as well.

```javascript
var gofigure = require("gofigure");

var certs = {
    ca: [ fs.readFileSync('ca.pem') ],
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem')
};

var ETCD_CONFIG = {endpoints: ["127.0.0.1:4001"], root: "/appname", ssloptions: certs};

var loader = gofigure({locations : [ETCD_CONFIG]});
loader.load(function(err, config){
    var PORT = config.port, HOST = config.host;
});
```

See [below](#etcdconfig) for notes about the supported Etcd layout.

<a name="monitoring"></a>
## Monitoring

Gofigure supports the monitoring of changes to configuration files.

<a name="monitoringAll"></a>
### All files or Etcd server

To enable monitoring you can specify monitor to true in the options.

```javascript
var gofigure = require("gofigure");

var loader = gofigure({monitor : true, files : ["/prod/configs/config1.json", __dirname + "/config.json"]});
var config = loader.loadSync();

loading.on("my.cool.property", function(newValue){
  //...do something
});
```
<a name="monitoringSome"></a>
### Individual Files

To monitor certain files you can use the files property and with object that have a `monitor : true` KV pair.

```javascript
var gofigure = require("gofigure");

var loader = gofigure({files : [
  {
    file : "/prod/configs/config1.json",
    monitor : true

  },
  __dirname + "/config.json"
]});
var config = loader.loadSync();

loading.on("my.cool.property", function(newValue){
  //...do something
});
```
Just `config1.json` will be monitored for changes.

<a name="monitoringSyntax"></a>
### Property topic syntax

To listen to all properties

```javascript
loading.on(function(config){
  //...do something
});

loading.on(function(nameOfPropertyChanged, config){
  //...do something
});

loading.on(function(nameOfPropertyChanged, value, config){
  //...do something
});
```

To listen to specific properties

```javascript
loading.on("my.cool.property", function(newValue){
  //...do something
});

loading.on("my.cool.property", function(newValue, config){
  //...do something
});

loading.on("my.cool.property", function(nameOfPropertyChanged, value, config){
  //...do something
});
```

Wild cards

```javascript

//listen to any property changed on the my.cool object
loading.on("my.cool.*", function(propName, newValue){
  //...do something
});


//listen to the change of a property named 'property' on any object
//that is a member of my
loading.on("my.*.property", function(propName, newValue){
  //...do something
});

//listen to the change of a property named 'property' that is
//a member of a property called cool
loading.on("*.cool.property", function(propName, newValue){
  //...do something
});

//listen to the change of property or otherProperty on the my.cool object.
loading.on("my.cool.{property|otherProperty}", function(propName, newValue){
  //...do something
});

//listen to the change of property or otherProperty on the my cool or
//notCool object.
loading.on("my.{cool|notCool}.{property|otherProperty}", function(propName, newValue){
  //...do something
});
```

<a name="monitoringCB"></a>
### Callback Arguments


The property change callback will pass in the following values depending on the arity of the callback.

If 1 argument is expected then just the callback invoked with the new value is a.

```javascript

loading.on("my.cool.property", function(newValue){
  //...do something
});


```

If two arguments are expected then it is invoked with the property name and the new value.


```javascript

loading.on("my.cool.property", function(propName, newValue){
  //...do something
});


```

Other wise the callback is invoked with the propertyName, newValue and the configuration object.

```javascript

loading.on("my.cool.property", function(propName, newValue, configObject){
  //...do something
});


```

<a name="environments"></a>
##Environments

`gofigure` also supports environments, by default it will look for `NODE_ENV` and if it is set then it will use it.

The following is an example configuration file

```javascript

{
    "development": {
        "logging":{
  	        "patio":{
			        "level":"DEBUG",
			        "appenders":[
				        {
					        "type":"RollingFileAppender",
					        "file":"/var/log/myApp/patio.log"
				        },
				        {
					        "type":"ConsoleAppender"
				        }
			        ]
		        }
        },
        "app" : {
          "host" : "localhost",
          "port" : "8088"
        },
        "MYSQL_DB" : "mysql://test:testpass@localhost:3306/dev_db",
        "MONGO_DB" : "mongodb://test:testpass@localhost:27017/dev_db"
    },
    "production": {
        "logging":{
            "patio":{
			        "level":"ERROR",
			        "appenders":[
				        {
					        "type":"RollingFileAppender",
					        "file":"/var/log/myApp/patio.log"
				        }
			        ]
		        }
        },
        "app" : {
          "host" : "prod.mydomain.com",
          "port" : "80"
        },
        "MYSQL_DB" : "mysql://test:testpass@prod.mydomain.com:3306/prod_db",
        "MONGO_DB" : "mongodb://test:testpass@prod.mydomain.com:27017/prd_db"
    },
    "test": {
        "logging":{
            "patio":{
			        "level":"INFO",
			        "appenders":[
				        {
					        "type":"RollingFileAppender",
					        "file":"/var/log/myApp/patio.log"
				        }
			        ]
		        }
        },
        "app" : {
          "host" : "test.mydomain.com",
          "port" : "80"
        },
        "MYSQL_DB" : "mysql://test:testpass@test.mydomain.com:3306/test_db",
        "MONGO_DB" : "mongodb://test:testpass@test.mydomain.com:27017/test_db"
    }
}

```

To load just the development properties set the `environment` to development.

```javascript

var gofigure = require("gofigure"),
    patio = require("patio"),
    mongoose = require("mongoose"),
    comb = require("comb"),
    DB, HOST, PORT;


var loader = gofigure({
  files : [__dirname + "/config-env.json"],
  environment : "development"
})
  .on("MYSQL_DB", function(uri){
    patio.connect(uri);
  })
  .on("MONGO_DB", function(uri){
    mongoose.connect(uri);
  })
  .on("logging", function(logging){
    new comb.logging.PropertyConfigurator().configure(logging);
    patio.configureLogging(logging);
  })
  .on("app", function(app){
    //...
  })
  .load(function(){
    //do something
  })

```

You may also share properties across enviroments by using `*` or overriding `defaultEnvironment` when initializing.

```json

{
    "*": {
         "logging":{
            "patio":{
                "level":"ERROR",
                "appenders":[
                    {
                        "type":"RollingFileAppender",
                        "file":"/var/log/myApp/patio.log"
                    }
                ]
            }
        },
        "app" : {
            "host" : "localhost",
            "port" : "8088"
        },
        "MYSQL_DB" : "mysql://test:testpass@localhost:3306/db",
        "MONGO_DB" : "mongodb://test:testpass@localhost:27017/db"
    },
    "development": {
        "logging":{
  	        "patio":{
                "appenders":[{
                    "type":"ConsoleAppender"
                }]
            }
        },
        "MYSQL_DB" : "mysql://test:testpass@localhost:3306/dev_db",
        "MONGO_DB" : "mongodb://test:testpass@localhost:27017/dev_db"
    },
    "production": {
        "app" : {
            "host" : "prod.mydomain.com",
            "port" : "80"
        },
        "MYSQL_DB" : "mysql://test:testpass@prod.mydomain.com:3306/prod_db",
        "MONGO_DB" : "mongodb://test:testpass@prod.mydomain.com:27017/prd_db"
    },
    "test": {
        "logging":{
            "patio":{
                "level":"INFO"
            }
        },
        "app" : {
          "host" : "test.mydomain.com",
          "port" : "80"
        },
        "MYSQL_DB" : "mysql://test:testpass@test.mydomain.com:3306/test_db",
        "MONGO_DB" : "mongodb://test:testpass@test.mydomain.com:27017/test_db"
    }
}

```

Now each environment only has to override properties specific to that env.

<a name="type"></a>
##Node Type

Since Etcd is a centralized configuration store, the concept of a node type needs to be introduced. By default `gofigure` will look for `NODE_TYPE` and, if it is set, then it will use it. To programmatically load just the production webapp properties set, the `environment` to production and `nodetype` to webapp.

```javascript
var gofigure = require("gofigure");

var ETCD_CONFIG = {endpoints: ["127.0.0.1:4001"], root: "/appname"};

var loader = gofigure({
  locations : [ETCD_CONFIG],
  environment : "production",
  nodetype : "webapp"
});
```

This can be defined in JSON as:

```json
{
    "type": {
        "production" : {
            "webapp" : {
                "host" : "prod.mydomain.com",
                "port" : "80"
            }
        },
        "development" : {
            "webapp" : {
                "host" : "localhost",
                "port" : "8088"
            }
        }
    }
}
```

Please see [Etcd Notes](#etcdconfig) for the supported Etcd layout for `NODE_TYPE`.

<a name="etcdconfig"></a>
##Etcd Notes

###Environment Layout

The expected layout within Etcd is the following:

127.0.0.1:4001/v2/keys/&lt;root&gt;/&lt;NODE_ENV&gt;

So, in the example above, `gofigure` will look for the following:

```javascript
process.env.NODE_ENV = "production";

var gofigure = require("gofigure");

var ETCD_CONFIG = {endpoints: ["127.0.0.1:4001"], root: "/appname"};
```

at this location within Etcd for keys:

127.0.0.1:4001/v2/keys/appname/production

###Type Layout

If process.env.NODE_TYPE is set, `gofigure` will look for the following:

127.0.0.1:4001/v2/keys/&lt;root&gt;/type/&lt;NODE_ENV&gt;/&lt;NODE_TYPE&gt;

For the following example:

```javascript
process.env.NODE_ENV = "production";
process.env.NODE_TYPE = "webapp";

var gofigure = require("gofigure");

var ETCD_CONFIG = {endpoints: ["127.0.0.1:4001"], root: "/appname"};
```

`gofigure` will look at this location within Etcd for keys:

127.0.0.1:4001/v2/keys/appname/type/production/webapp


###Special Environment Names

The following environment names are special and not be used with process.env.NODE_ENV:

* &#42;
* type

License
-------

MIT <https://github.com/C2FO/gofigure/raw/master/LICENSE>

Meta
----

* Code: `git clone git://github.com/c2fo/gofigure.git`
* Website:  <http://c2fo.com> - Twitter: <http://twitter.com/c2fo> - 877.465.4045
