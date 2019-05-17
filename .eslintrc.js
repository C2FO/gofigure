module.exports = {
    env: {
        commonjs: true,
        es6: true,
        mocha: true
    },
    extends: 'airbnb-base',
    globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
    },
    parserOptions: {
        ecmaVersion: 2018,
    },
    rules: {
        "indent": [
            "error",
            4
        ],
        "comma-dangle": ["error", {
            "arrays": "always-multiline",
            "objects": "always-multiline",
            "imports": "always-multiline",
            "exports": "always-multiline",
            "functions": "never"
        }],
        "no-restricted-syntax": ["error", "ForInStatement", "LabeledStatement", "WithStatement"],
        "object-curly-spacing": ["error", "always"],
        "array-bracket-spacing": ["error", "always"],
        "no-underscore-dangle": 0,
        "max-len": ["error", 120, 2, {
            ignoreComments: false,
            ignoreUrls: true,
            ignoreRegExpLiterals: true,
            ignoreStrings: true,
            ignoreTemplateLiterals: true,
        }]
    },
};
