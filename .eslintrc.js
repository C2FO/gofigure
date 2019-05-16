module.exports = {
    "extends": "airbnb-base",
    "parserOptions": {
        "sourceType": "script"
    },
    "env":{
        "mocha": true
    },
    "rules": {
        "no-buffer-constructor": 0,
        "no-use-before-define": [
            "error", {
                "functions": false
            }
        ],
        "indent": [
            "error",
            4
        ],
        "func-names": ["error", "always"],
        "object-curly-spacing": [ "error", "always" ],
        "array-bracket-spacing": [ "error", "always" ],
        "comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "never"
        }],
        "class-methods-use-this": 0,
        "prefer-destructuring": 0,
        "prefer-rest-params": 0,
        "prefer-spread": 0,
        "no-unused-vars": ["error", { "vars": "all", "args": "after-used", "ignoreRestSiblings": false }],
        "arrow-body-style": 0,
        "strict": [
            "error",
            "global"
        ],
        "no-underscore-dangle": 0,
        "no-plusplus": [
            "error",
            {
                "allowForLoopAfterthoughts": true
            }
        ],
        "no-param-reassign": [
            "error",
            {
                "props": false
            }
        ],
        "no-shadow": ["error", {"allow": ["it"]}],
        // overriding default length from 100 to 120; all other existing options must also be specified in the override
        // base: https://github.com/airbnb/javascript/blob/eslint-config-airbnb-v13.0.0/packages/eslint-config-airbnb-base/rules/style.js#L128
        "max-len": ["error", 120, 2, {
            ignoreUrls: true,
            ignoreComments: false,
            ignoreUrls: true,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }]
    }
};