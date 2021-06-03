/* eslint-disable no-template-curly-in-string */

const assert = require('assert');
const replacer = require('../../lib/processor/replacer');

describe('processor replacer', () => {
    describe('.doReplaceOnString', () => {
        it('should replace env variables', () => {
            const envVariables = {
                ENV_A: 'a_env_${A}}var',
                ENV_B: 'b_env_var',
            };
            // simple
            assert.strictEqual(
                replacer.doReplaceOnString('${ENV_A}', envVariables),
                envVariables.ENV_A
            );
            // multiples
            assert.strictEqual(
                replacer.doReplaceOnString('${ENV_A}-${ENV_B}', envVariables),
                `${envVariables.ENV_A}-${envVariables.ENV_B}`
            );
            // multiples with an escaped
            assert.strictEqual(
                replacer.doReplaceOnString('${ENV_A}-$${ENV_B}-${ENV_B}', envVariables),
                `${envVariables.ENV_A}-$\${ENV_B}-${envVariables.ENV_B}`
            );
            // env nested inside of an escaped one
            assert.strictEqual(
                replacer.doReplaceOnString('${ENV_A}-$${B-${ENV_B}}', envVariables),
                `${envVariables.ENV_A}-$\${B-${envVariables.ENV_B}}`
            );
        });

        describe('with default value', () => {
            describe("':-' default modifier", () => {
                it('should use the environment variable values if the ENV variable is set', () => {
                    const envVariables = {
                        ENV_A: 'A_ENV_VAR',
                        ENV_B: 'B_ENV_VAR',
                    };
                    // simple
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}', envVariables),
                        'A_ENV_VAR'
                    );
                    // multiples
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-${ENV_B:-b_env_var}', envVariables),
                        'A_ENV_VAR-B_ENV_VAR'
                    );
                    // multiples with an escaped
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-$${ENV_B}-${ENV_B:-b_env_var}', envVariables),
                        'A_ENV_VAR-$${ENV_B}-B_ENV_VAR'
                    );
                    // env nested inside of an escaped one
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-$${B:-${ENV_B:-b_env_var}}', envVariables),
                        'A_ENV_VAR-$${B:-B_ENV_VAR}'
                    );
                });

                it('should use default values if provided and the ENV variable is unset', () => {
                    const envVariables = {};
                    // simple
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}', envVariables),
                        'a_env_var'
                    );
                    // multiples
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-${ENV_B:-b_env_var}', envVariables),
                        'a_env_var-b_env_var'
                    );
                    // multiples with an escaped
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-$${ENV_B}-${ENV_B:-b_env_var}', envVariables),
                        'a_env_var-$${ENV_B}-b_env_var'
                    );
                    // env nested inside of an escaped one
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-$${B:-${ENV_B:-b_env_var}}', envVariables),
                        'a_env_var-$${B:-b_env_var}'
                    );
                });

                it('should use default values if provided and the ENV variable is empty', () => {
                    const envVariables = {
                        ENV_A: '',
                        ENV_B: '',
                    };
                    // simple
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}', envVariables),
                        'a_env_var'
                    );
                    // multiples
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-${ENV_B:-b_env_var}', envVariables),
                        'a_env_var-b_env_var'
                    );
                    // multiples with an escaped
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-$${ENV_B}-${ENV_B:-b_env_var}', envVariables),
                        'a_env_var-$${ENV_B}-b_env_var'
                    );
                    // env nested inside of an escaped one
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A:-a_env_var}-$${B:-${ENV_B:-b_env_var}}', envVariables),
                        'a_env_var-$${B:-b_env_var}'
                    );
                });
            });

            describe("'-' default modifier", () => {
                it('should use the environment variable values if the ENV variable is set', () => {
                    const envVariables = {
                        ENV_A: 'A_ENV_VAR',
                        ENV_B: 'B_ENV_VAR',
                    };
                    // simple
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}', envVariables),
                        'A_ENV_VAR'
                    );
                    // multiples
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-${ENV_B-b_env_var}', envVariables),
                        'A_ENV_VAR-B_ENV_VAR'
                    );
                    // multiples with an escaped
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-$${ENV_B}-${ENV_B-b_env_var}', envVariables),
                        'A_ENV_VAR-$${ENV_B}-B_ENV_VAR'
                    );
                    // env nested inside of an escaped one
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-$${B-${ENV_B-b_env_var}}', envVariables),
                        'A_ENV_VAR-$${B-B_ENV_VAR}'
                    );
                });

                it('should use default values if provided and the ENV variable is not set', () => {
                    const envVariables = {};
                    // simple
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}', envVariables),
                        'a_env_var'
                    );
                    // multiples
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-${ENV_B-b_env_var}', envVariables),
                        'a_env_var-b_env_var'
                    );
                    // multiples with an escaped
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-$${ENV_B}-${ENV_B-b_env_var}', envVariables),
                        'a_env_var-$${ENV_B}-b_env_var'
                    );
                    // env nested inside of an escaped one
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-$${B:-${ENV_B-b_env_var}}', envVariables),
                        'a_env_var-$${B:-b_env_var}'
                    );
                });

                it('should use default values if provided and the ENV variable is empty', () => {
                    const envVariables = {
                        ENV_A: '',
                        ENV_B: '',
                    };
                    // simple
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}', envVariables),
                        ''
                    );
                    // multiples
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-${ENV_B-b_env_var}', envVariables),
                        '-'
                    );
                    // multiples with an escaped
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-$${ENV_B}-${ENV_B-b_env_var}', envVariables),
                        '-$${ENV_B}-'
                    );
                    // env nested inside of an escaped one
                    assert.strictEqual(
                        replacer.doReplaceOnString('${ENV_A-a_env_var}-$${B:-${ENV_B-b_env_var}}', envVariables),
                        '-$${B:-}'
                    );
                });
            });
        });

        describe("':?' modifier", () => {
            it('should NOT throw an error if the ENV variable is present', () => {
                const envVariables = {
                    ENV_A: 'a_env_var',
                };
                // simple
                assert.strictEqual(replacer.doReplaceOnString('${ENV_A:?"Missing ENV_A variable"}', envVariables), 'a_env_var');
            });

            it('should throw an error if the throw if unset is true and the ENV variable is not present', () => {
                const envVariables = {};
                // simple
                assert.throws(() => {
                    replacer.doReplaceOnString('${ENV_A:?Missing ENV_A variable}', envVariables);
                }, (e) => e.message === 'Missing ENV_A variable');
            });

            it('should throw an default error if the throw if unset is true and the ENV variable is not present', () => {
                const envVariables = {};
                // simple
                assert.throws(() => {
                    replacer.doReplaceOnString('${ENV_A:?}', envVariables);
                }, (e) => e.message === "'ENV_A' is either empty or unset in ENV variables");
            });

            it('should throw an error if the value is empty', () => {
                const envVariables = {
                    ENV_A: '',
                };
                assert.throws(() => {
                    replacer.doReplaceOnString('${ENV_A:?Missing ENV_A variable}', envVariables);
                }, (e) => e.message === 'Missing ENV_A variable');
            });
        });

        describe("'?' modifier", () => {
            it('should NOT throw an error if the ENV variable is present', () => {
                const envVariables = {
                    ENV_A: 'a_env_var',
                };
                // simple
                assert.strictEqual(replacer.doReplaceOnString('${ENV_A?"Missing ENV_A variable"}', envVariables), 'a_env_var');
            });

            it('should throw an error if the throw if unset is true and the ENV variable is not present', () => {
                const envVariables = {};
                // simple
                assert.throws(() => {
                    replacer.doReplaceOnString('${ENV_A?Missing ENV_A variable}', envVariables);
                }, (e) => e.message === 'Missing ENV_A variable');
            });

            it('should throw a default error if the throw if unset is true and the ENV variable is not present', () => {
                const envVariables = {};
                // simple
                assert.throws(() => {
                    replacer.doReplaceOnString('${ENV_A?}', envVariables);
                }, (e) => e.message === "'ENV_A' is either empty or unset in ENV variables");
            });

            it('should NOT throw an error if the value is empty', () => {
                const envVariables = {
                    ENV_A: '',
                };
                assert.strictEqual(replacer.doReplaceOnString('${ENV_A?Missing ENV_A variable"}', envVariables), '');
            });
        });
    });

    describe('replacing in objects', () => {
        it('should replace env variables at the root of an object', () => {
            const config = {
                a: '${ENV_A}',
            };
            const replaced = replacer(config, {
                environmentVariables: {
                    ENV_A: 'a_env_var',
                },
            });
            assert.deepStrictEqual(replaced, {
                a: 'a_env_var',
            });
        });

        it('should replace env variables in a nested object', () => {
            const config = {
                a: {
                    b: '${ENV_A_B}',
                },
            };
            const replaced = replacer(config, {
                environmentVariables: {
                    ENV_A_B: 'a_b_env_var',
                },
            });
            assert.deepStrictEqual(replaced, {
                a: { b: 'a_b_env_var' },
            });
        });
    });

    describe('replacing in arrays', () => {
        it('should replace env variables in strings in an array', () => {
            const config = {
                a: [ '${ENV_0}', '${ENV_1}' ],
            };
            const replaced = replacer(config, {
                environmentVariables: {
                    ENV_0: 'zero',
                    ENV_1: 'one',
                },
            });
            assert.deepStrictEqual(replaced, {
                a: [ 'zero', 'one' ],
            });
        });

        it('should replace env variables in objects in arrays', () => {
            const config = {
                a: [ { a: { value: '${ENV_0}' } }, { a: { value: '${ENV_1}' } } ],
            };
            const replaced = replacer(config, {
                environmentVariables: {
                    ENV_0: 'zero',
                    ENV_1: 'one',
                },
            });
            assert.deepStrictEqual(replaced, {
                a: [ { a: { value: 'zero' } }, { a: { value: 'one' } } ],
            });
        });
    });

    it('should ignore non string values', () => {
        const config = {
            true: true,
            false: false,
            number: 0.01,
        };
        const replaced = replacer(config, {
            environmentVariables: {
                ENV_0: 'zero',
                ENV_1: 'one',
            },
        });
        assert.deepStrictEqual(replaced, {
            true: true,
            false: false,
            number: 0.01,
        });
    });
});
