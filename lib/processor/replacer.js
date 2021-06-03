const _ = require('lodash');
const processorHelper = require('./processorHelper');

const { getFlattenedObject } = processorHelper;

const EMPTY_STRING = '';
const DOLLAR_SIGN = '$';
const UNSET_MODIFIER = '-';
const UNSET_OR_EMPTY_MODIFIER = `:${UNSET_MODIFIER}`;
const THROW_IF_UNSET_MODIFIER = '?';
const THROW_IF_UNSET_OR_EMPTY_MODIFIER = `:${THROW_IF_UNSET_MODIFIER}`;
// matches:
// ${ENV_VAR}
// ${ENV_VAR:-default}
// ${ENV_VAR-default}
// ${ENV_VAR?message}
// ${ENV_VAR?}
// ${ENV_VAR:?message}
// ${ENV_VAR:?}
const ENV_VARIABLE_REGEXP = /(\$?)\${(\w+(?:_\w+)*)(?:(:?[-?]){1}([^}]*))*}/;

const shouldSetIfUnset = (modifier) => modifier === UNSET_MODIFIER;
const shouldSetIfUnsetOrEmpty = (modifier) => modifier === UNSET_OR_EMPTY_MODIFIER;
const shouldThrowIfUnset = (modifier) => modifier === THROW_IF_UNSET_MODIFIER;
const shouldThrowIfUnsetOrEmpty = (modifier) => modifier === THROW_IF_UNSET_OR_EMPTY_MODIFIER;

const performReplace = (configValue, matchedReplacement, replacement) => configValue
    .replace(matchedReplacement, replacement);

const doReplaceOnString = (str, envVars) => {
    const _doReplace = (val) => {
        const match = val.match(ENV_VARIABLE_REGEXP);
        if (match) {
            const fullMatch = match[0];
            const prev = match[1];
            if (prev === DOLLAR_SIGN) {
                const endIndex = match.index + 2; // skip past the '$$'
                // its espaced with a dollar sign so skip this value and replace on the rest of ths string
                return `${val.slice(0, endIndex)}${_doReplace(val.slice(endIndex))}`;
            }
            const envVarName = match[2];
            const modifier = match[3];
            const hasEnvVar = _.has(envVars, envVarName);
            const envVarValue = hasEnvVar ? envVars[envVarName] : EMPTY_STRING;
            const isEmptyOrUnset = !hasEnvVar || envVarValue === EMPTY_STRING;
            const replaceAndSkipToEndOfMatch = (replacement) => {
                const endIndex = match.index + fullMatch.length; // skip past the '$$'
                // its espaced with a dollar sign so skip this value and replace on the rest of ths string
                return `${performReplace(val.slice(0, endIndex), fullMatch, replacement)}${_doReplace(val.slice(endIndex))}`;
            };
            if (!isEmptyOrUnset || !modifier) {
                return replaceAndSkipToEndOfMatch(envVarValue);
            }

            const defaultValue = match[4] || EMPTY_STRING;
            if (!hasEnvVar) {
                if (shouldThrowIfUnset(modifier)) {
                    throw new Error(defaultValue || `'${envVarName}' is either empty or unset in ENV variables`);
                }
                if (shouldSetIfUnset(modifier)) {
                    return replaceAndSkipToEndOfMatch(defaultValue);
                }
            }
            if (shouldThrowIfUnsetOrEmpty(modifier)) {
                throw new Error(defaultValue || `'${envVarName}' is either empty or unset in ENV variables`);
            }
            if (shouldSetIfUnsetOrEmpty(modifier)) {
                return replaceAndSkipToEndOfMatch(defaultValue);
            }
            // call replace again to ensure we get all matches
            return replaceAndSkipToEndOfMatch(EMPTY_STRING);
        }
        return val;
    };
    return _doReplace(str, 0);
};

const doReplace = (any, envVars) => {
    if (_.isString(any)) {
        return doReplaceOnString(any, envVars);
    }
    if (_.isPlainObject(any)) {
        const flattened = getFlattenedObject(any);
        const flattenedReplaced = Object.keys(flattened).reduce((replaced, key) => {
            const val = flattened[key];
            return Object.assign(replaced, { [key]: doReplace(val, envVars) });
        }, {});
        return Object.keys(flattenedReplaced).reduce((replacedObj, key) => {
            _.set(replacedObj, key, flattenedReplaced[key]);
            return replacedObj;
        }, {});
    }
    if (_.isArray(any)) {
        return any.map((v) => doReplace(v, envVars));
    }
    return any;
};

const replacer = (config, opts) => {
    const options = opts || {};
    return doReplace(config, options.environmentVariables || {});
};

replacer.doReplaceOnString = doReplaceOnString;

module.exports = replacer;
