"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const assertion_error_1 = require("assertion-error");
function code(code) {
    return result => {
        if (code !== result.code) {
            const message = `Expected exit code: "${code}", actual: "${result.code}"`;
            return error(result, message, code, result.code);
        }
    };
}
exports.code = code;
function time() {
    return result => {
        if (result.killed) {
            return error(result, 'Command execution terminated (timeout)');
        }
    };
}
exports.time = time;
function stderr(expected) {
    return result => assertOut('stderr', expected, result);
}
exports.stderr = stderr;
function stdout(expected) {
    return result => assertOut('stdout', expected, result);
}
exports.stdout = stdout;
function exists(path) {
    return result => {
        if (fs_1.default.existsSync(path) !== true) {
            return error(result, `Expected "${path}" to exist.`);
        }
    };
}
exports.exists = exists;
function match(path, data) {
    return result => {
        const contents = fs_1.default.readFileSync(path, { encoding: 'utf8' });
        const statement = data instanceof RegExp ? data.test(contents) : data === contents;
        if (statement !== true) {
            const message = `Expected "${path}" to match "${data}", but it was: "${contents}"`;
            return error(result, message, data, contents);
        }
    };
}
exports.match = match;
function assertOut(key, expected, result) {
    const actual = result[key];
    const statement = expected instanceof RegExp ? expected.test(actual) : expected === actual;
    if (statement !== true) {
        const message = `Expected ${key} to match "${expected}". Actual: "${actual}"`;
        return error(result, message, expected, actual);
    }
}
function error(result, message, expected, actual) {
    const err = new assertion_error_1.default(`\`${result.cmd}\`: ${message}`);
    err.result = result;
    if (expected)
        err.expected = expected;
    if (actual)
        err.actual = actual;
    return err;
}
//# sourceMappingURL=expectations.js.map