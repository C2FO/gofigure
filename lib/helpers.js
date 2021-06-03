function denodeify(fn, scope) {
    function _denodeify(...args) {
        return new Promise((resolve, reject) => {
            fn.apply(scope || this, [ ...args, (err, result) => {
                if (err) {
                    return reject(err);
                }
                return resolve(result);
            } ]);
        });
    }
    return _denodeify;
}

module.exports = {
    denodeify,
};
