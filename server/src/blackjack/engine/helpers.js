var isNull = exports.isNull = function isNull(obj) {
    return obj === null;
};

var isUndefined = exports.isUndefined = function isUndefined(obj) {
    return obj === undefined;
};

var isNullOrUndef = exports.isNullOrUndef = function isNullOrUndef(obj) {
    return isUndefined(obj) || isNull(obj);
};

module.exports = exports;