var fs = require('fs');
var AssertionError = require('assertion-error');
exports.code = function (code) {
    return function (result) {
        if (code !== result.code) {
            var message = "Expected exit code: \"" + code + "\", actual: \"" + result.code + "\"";
            return error(result, message, code, result.code);
        }
    };
};
exports.time = function () {
    return function (result) {
        if (result.killed) {
            return error(result, 'Command execution terminated (timeout)');
        }
    };
};
exports.stderr = function (expected) {
    return function (result) {
        return assertOut('stderr', expected, result);
    };
};
exports.stdout = function (expected) {
    return function (result) {
        return assertOut('stdout', expected, result);
    };
};
exports.exists = function (path) {
    return function (result) {
        if (fs.existsSync(path) !== true) {
            return error(result, "Expected \"" + path + "\" to exist.");
        }
    };
};
exports.match = function (path, data) {
    return function (result) {
        var contents = fs.readFileSync(path, { encoding: 'utf8' });
        var statement = data instanceof RegExp ? data.test(contents) : data === contents;
        if (statement !== true) {
            var message = "Expected \"" + path + "\" to match \"" + data + "\", but it was: \"" + contents + "\"";
            return error(result, message, data, contents);
        }
    };
};
function assertOut(key, expected, result) {
    var actual = result[key];
    var statement = expected instanceof RegExp ? expected.test(actual) : expected === actual;
    if (statement !== true) {
        var message = "Expected " + key + " to match \"" + expected + "\". Actual: \"" + actual + "\"";
        return error(result, message, expected, actual);
    }
}
function error(result, message, expected, actual) {
    var err = new AssertionError("`" + result.cmd + "`: " + message);
    err.result = result;
    if (expected)
        err.expected = expected;
    if (actual)
        err.actual = actual;
    return err;
}
//# sourceMappingURL=expectations.js.map