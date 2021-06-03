module.exports = {
  env: {
    commonjs: true,
    es6: true,
    jest: true,
  },
  extends: [
    'airbnb-base',
    'plugin:jest/recommended',
    'eslint:recommended',
    'plugin:jest/style',
    'plugin:prettier/recommended',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
    'no-underscore-dangle': 0,
  },
};
