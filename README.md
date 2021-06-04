[![Test](https://github.com/C2FO/gofigure/actions/workflows/test.yml/badge.svg?branch=master)](https://github.com/C2FO/gofigure/actions/workflows/test.yml)[![Coverage Status](https://coveralls.io/repos/github/C2FO/gofigure/badge.svg?branch=master)](https://coveralls.io/github/C2FO/gofigure?branch=master)

# gofigure

Gofigure is a configuration tool for node to help in the gathering and monitoring of configuration files in node.

# Installation

```
npm install gofigure
```

# Usage


  * [Loading A Configuration](#load)
    * [Directories](#loadDir)
    * [Files](#loadFiles)
  * [Monitoring Property Changes](#monitoring)
    * [Monitoring All Files](#monitoringAll)
    * [Monitoring Certain Files](#monitoringSome)
    * [Property Topic Syntax](#monitoringSyntax)
    * [Property Change Callback](#monitoringCB)
  * [Environment Variables](#environmentVariables)
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
const gofigure = require('gofigure');
```

Load configurations from a directory
```javascript
//Loader for directory of configurations
const loader = gofigure({
  locations : [path.resolve(__dirname, 'configs')]
});
```

Load configurations from a files.
```javascript
const loader = gofigure({
  locations : [path.resolve(process.env.HOME, 'configs/config1.json'), path.resolve(__dirname, 'config1.json')]
});

```

You can load configurations asynchronously

```javascript
loader.load().then((config) => {
    const { PORT, HOST } = config;
});
```

or synchronously

```javascript
const loader = gofigure({locations : [path.resolve(__dirname, 'configs')]});
const config = loader.loadSync();
```

<a name="loadDir"></a>
### Directories of configurations
To load directories that contain configuration files in the options object provide locations property that is an array of directories than contain your configurations.

```js

const gofigure = require('gofigure');

const loader = gofigure({ locations : [ path.resolve(__dirname, 'configs') ] });
loader.load().then((config) => {
    const { PORT, HOST } = config;
});
```

The order of the locations matter as it defines a precedence for files. For example suppose you have a directory of default configuration files, and on production you want to override those configuration with environment specific configurations with out changing your module or source controlled files.

```javascript
const gofigure = require('gofigure');

const loader = gofigure({ locations : [ '/prod/confgis', path.resolve(__dirname, 'configs') ] });
loader.load().then((config) => {
    const { PORT, HOST } = config;
});
```

Here any production configuration files found in `/prod/configs` will override the properties in `path.resolve(__dirname, 'configs')`.

Another use case might be in development where you have default properties and instead of altering the source controlled files the developer can override them by putting them in their home directory.

```javascript
const gofigure = require('gofigure');
const HOME = process.env.HOME;

const loader = gofigure({ locations : [ path.resolve(HOME, 'yourApp/configs'), path.resolve(__dirname, 'configs') ] });
loader.load().then((config) => {
    const { PORT, HOST } = config;
});
```

<a name="loadFiles"></a>
### Files

You may also load specific files rather than entire directories.

```javascript
const gofigure = require('gofigure');

const loader = gofigure({ locations : [ '/prod/configs/config1.json', path.resolve(__dirname, 'config1.json') ] });
loader.load().then((config) => {
    const { PORT, HOST } = config;
});
```

Again order matters `/prod/configs/config1.json` will override `path.resolve(__dirname, '/config.json')`

<a name="monitoring"></a>
## Monitoring

Gofigure supports the monitoring of changes to configuration files.

<a name="monitoringAll"></a>
### All files or Etcd server

To enable monitoring you can specify monitor to true in the options.

```javascript
const gofigure = require('gofigure');

const loader = gofigure({
    monitor : true, 
    locations : [ 
        '/prod/configs/config1.json', 
        path.resolve(__dirname , '/config.json'),
    ],
});
const config = loader.loadSync();

loader.on('my.cool.property', (newValue) => {
  //the property has changed do something with it
});
```
<a name="monitoringSome"></a>
### Individual Files

To monitor certain files you can use the files property and with object that have a `monitor : true` KV pair.

```javascript
const path = require('path');
const gofigure = require('gofigure');

const loader = gofigure({locations : [
  {
    file : '/prod/configs/config1.json',
    monitor : true

  },
  path.resolve(__dirname, 'config.json')
]});
const config = loader.loadSync();

loader.on('my.cool.property', (newValue) => {
  //...do something
});
```
Just `config1.json` will be monitored for changes.

<a name="monitoringSyntax"></a>
### Property topic syntax

To listen to all properties

```javascript
loader.on((config) => {
  //...do something
});

loader.on((nameOfPropertyChanged, config) => {
  //...do something
});

loader.on((nameOfPropertyChanged, value, config) => {
  //...do something
});
```

To listen to specific properties

```javascript
loader.on('my.cool.property', (newValue) => {
  //...do something
});

loader.on('my.cool.property', (newValue, config) => {
  //...do something
});

loader.on('my.cool.property', (nameOfPropertyChanged, value, config) => {
  //...do something
});
```

Wild cards

```javascript

//listen to any property changed on the my.cool object
loader.on("my.cool.*", (propName, newValue) => {
  //...do something
});


//listen to the change of a property named 'property' on any object
//that is a member of my
loader.on("my.*.property", (propName, newValue) => {
  //...do something
});

//listen to the change of a property named 'property' that is
//a member of a property called cool
loader.on("*.cool.property", (propName, newValue) => {
  //...do something
});

//listen to the change of property or otherProperty on the my.cool object.
loader.on("my.cool.{property|otherProperty}", (propName, newValue) => {
  //...do something
});

//listen to the change of property or otherProperty on the my cool or
//notCool object.
loader.on("my.{cool|notCool}.{property|otherProperty}", (propName, newValue) => {
  //...do something
});
```

<a name="monitoringCB"></a>
### Callback Arguments


The property change callback will pass in the following values depending on the arity of the callback.

If 1 argument is expected then just the callback invoked with the new value is a.

```javascript
loader.on('my.cool.property', (newValue) => {
  //...do something
});
```

If two arguments are expected then it is invoked with the property name and the new value.


```javascript
loader.on('my.cool.property', (propName, newValue) => {
  //...do something
});
```

Other wise the callback is invoked with the propertyName, newValue and the configuration object.

```javascript
loader.on('my.cool.property', (propName, newValue, configObject) => {
  //...do something
});
```

<a name="environmentVariables"></a>
## Environment Variables

`gofigure` supports the replacement of environment variables in the configurations usings the following syntax.

* `${ENV_VARIABLE_NAME}` - Sets the value to `process.env.ENV_VARIABLE_NAME` or `''` if it is unset
* `${ENV_VARIABLE_NAME:-default}` - Evaluates to the default value if the `ENV_VARIABLE_NAME` is unset or empty
* `${ENV_VARIABLE_NAME-default}` - Evaluates to the default value if the `ENV_VARIABLE_NAME` is unset
* `${ENV_VARIABLE_NAME:?err}` - Throws an error with the message if `ENV_VARIABLE_NAME` is unset or empty
* `${ENV_VARIABLE_NAME?err}` - Throws an error with the message if `ENV_VARIABLE_NAME` is unset

You can use `$$` if you want to ignore a substitution `$${SOME_VALUE}`.

### Example

Given the following config

```json
{
    "a": "${ENV_VAR_A}",
    "b" : {
        "c": "${ENV_VAR_B:-b.c}" 
    },
    "arr": ["${ARR_INDEX_0}", "${ARR_INDEX_1}"],
    "arrWithObjects": [
        { "value": "${ARR_INDEX_0}" },
        { "value": "${ARR_INDEX_1}" }
    ]
}
``` 

And the following environemnt

```sh
ENV_VAR_A=a
ENV_VAR_B=
ARR_INDEX_0=zero
ARR_INDEX_1=one
```

Would produce 

```json
{
    "a": "a",
    "b" : {
        "c": "b.c" 
    },
    "arr": ["zero", "one"],
    "arrWithObjects": [
        { "value": "zero" },
        { "value": "one" }
    ]
}
``` 


<a name="environments"></a>
##Environments

**Reserved Property Names**

The following environment names are reserved and not be used when process.env.NODE_ENV or `environment` is set.

* `*`
* `type`

### NODE_ENV

`gofigure` also supports environments, by default it will look for `NODE_ENV` and if it is set then it will use it.

The following is an example configuration file

```json

{
    "development": {
        "logging":{
            "level": "DEBUG"
        },
        "app" : {
          "host" : "localhost",
          "port" : "8088"
        },
        "MYSQL_DB" : "mysql://test:testpass@localhost:3306/db",
        "MONGO_DB" : "mongodb://test:testpass@localhost:27017/db"
    },
    "production": {
        "logging":{
            "level": "ERROR"
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
            "level": "WARN"
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

const gofigure = require('gofigure');

const loader = gofigure({
  files : [__dirname + "/config-env.json"],
  environment : "development"
});

loader.on("MYSQL_DB", (uri) => {
    //connect to database
});

loader.on("MONGO_DB", (uri) => {
    //connect to mongo
})

loader.on("logging", (logging) => {
    //set up logging
})

loader.on("app", (app) => {
    //set up your app
});

loader.load.then((config) => {
    //use your config
});

```

You may also share properties across environments by using `*` or overriding `defaultEnvironment` when initializing.

```json

{
    "*": {
         "logging": {
            "level": "DEBUG"            
        },
        "app" : {
            "host" : "0.0.0.0",
            "port" : "8088"
        },
        "MYSQL_DB" : "mysql://test:testpass@localhost:3306/db",
        "MONGO_DB" : "mongodb://test:testpass@localhost:27017/db"
    },
    "production": {
        "app" : {
            "port" : "80"
        },
        "MYSQL_DB" : "mysql://test:testpass@prod.mydomain.com:3306/prod_db",
        "MONGO_DB" : "mongodb://test:testpass@prod.mydomain.com:27017/prd_db"
    },
    "test": {
        "app" : {
          "port" : "80"
        },
        "MYSQL_DB" : "mysql://test:testpass@test.mydomain.com:3306/test_db",
        "MONGO_DB" : "mongodb://test:testpass@test.mydomain.com:27017/test_db"
    }
}

```

Now each environment only has to override properties specific to that env.

<a name="type"></a>
##NODE_TYPE

**NOTE** This is to used with [`NODE_ENV`](#environments).

`NODE_TYPE` allows you to change configurations based on the type of app instance (node). 

For example in production you could put your common configurations in the `production` section of the config. And then add
additional configurations under a `webapp` and `workerQueue` config. 

For example you could have have a config that looks like the following.

```json
{
    "production": {
        "dbHost": "prod-db"
    },
    "development": {
        "dbHost": "localhost"
    },
    
    "type":{
        "production": {
            "webapp": {
                "port": 80
            },
            "workerQueue": {
                "amqpHost": "msgs",
                "numberOfWorkers": 8
            }
        },
        "development": {
            "webapp": {
                "port": 8080
            },
            "workerQueue": {
                "amqpHost": "localhost",
                "numberOfWorkers": 1
            }
        }
    }
}
```


If `NODE_ENV=production` and `NODE_TYPE=webapp` your config would

```javascript
const loader = gofigure({ locations : [ 'path/to/config' ] });

const config = loader.loadSync();

console.log(config);
```

Your config would look like the following.

```json
{
    "dbHost": "prod-db",
    "port": 80
}
```

Alternatively if `NODE_ENV=production` and `NODE_TYPE=workerQueue` your config would be.

```json
{
    "dbHost": "prod-db",
    "amqpHost": "msgs",
    "numberOfWorkers": 8
}
```

`NODE_ENV=development` and `NODE_TYPE=webapp` your config would be.

```json
{
    "dbHost": "localhost",
    "port": 8080 
}
```

`NODE_ENV=development` and `NODE_TYPE=workerQueue` your config would be.

```json
{
    "dbHost": "localhost",
    "amqpHost": "localhost",
    "numberOfWorkers": 1 
}
```

License
-------

MIT <https://github.com/C2FO/gofigure/raw/master/LICENSE>

Meta
----

* Code: `git clone git://github.com/c2fo/gofigure.git`
* Website:  <http://c2fo.com> - Twitter: <http://twitter.com/c2fo> - 877.465.4045
