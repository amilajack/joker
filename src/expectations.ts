import fs from 'fs';
import AssertionError from 'assertion-error';
import Result from './result';

export type AssertionFn = (res: Result) => AssertionError | undefined;

/**
 * Return an exit code expectation.
 *
 * @param {Number} expected exit code.
 * @returns {Function}
 * @api public
 */

export function code(code: number): AssertionFn {
  return (result: Result) => {
    if (code !== result.code) {
      const message = `Expected exit code: "${code}", actual: "${result.code}"`;
      return error(result, message, code, result.code);
    }
    return;
  };
}

/**
 * Return no timeout expectation.
 *
 * @returns {Function}
 * @api public
 */

export function time(): AssertionFn {
  return (result: Result) => {
    if (result.killed) {
      return error(result, 'Command execution terminated (timeout)');
    }
  };
}

/**
 * Return a stderr expectation.
 *
 * @param {String|RegExp} expected string or regular express to match
 * @returns {Function}
 * @api public
 */

export function stderr(expected: String | RegExp): AssertionFn {
  return (result: Result) => assertOut('stderr', expected, result);
}

/**
 * Return a stdout expectation.
 *
 * @param {String|RegExp} expected string or regular express to match
 * @returns {Function}
 * @api public
 */

export function stdout(expected: String | RegExp): AssertionFn {
  return (result: Result) => assertOut('stdout', expected, result);
}

/**
 * Verify that a `path` exists.
 *
 * @param {String} path
 * @returns {Function}
 * @api public
 */

export function exists(path: string): AssertionFn {
  return (result: Result) => {
    if (fs.existsSync(path) !== true) {
      return error(result, `Expected "${path}" to exist.`);
    }
  };
}

/**
 * Verify that `path`'s data matches `data`.
 *
 * @param {String} path
 * @param {String|RegExp} data
 * @returns {Function}
 * @api public
 */

export function match(path: string, data: String | RegExp): AssertionFn {
  return (result: Result) => {
    const contents = fs.readFileSync(path, { encoding: 'utf8' });
    const statement =
      data instanceof RegExp ? data.test(contents) : data === contents;

    if (statement !== true) {
      const message = `Expected "${path}" to match "${data}", but it was: "${contents}"`;
      return error(result, message, data, contents);
    }
  };
}

/**
 * Assert stdout or stderr.
 *
 * @param {String} stdout/stderr
 * @param {Mixed} expected
 * @param {Result} result
 * @returns {AssertionError|null}
 * @api private
 */

function assertOut(key: string, expected: any, result: Result): AssertionFn {
  const actual = result[key];
  const statement =
    expected instanceof RegExp ? expected.test(actual) : expected === actual;

  if (statement !== true) {
    const message = `Expected ${key} to match "${expected}". Actual: "${actual}"`;
    return error(result, message, expected, actual);
  }
  return;
}

/**
 * Create and return a new `AssertionError`.
 * It will assign the given `result` to it, it will also prepend the executed command
 * to the error message.
 *
 * Assertion error is a constructor for test and validation frameworks that implements
 * standardized Assertion Error specification.
 *
 * For more info go visit https://github.com/chaijs/assertion-error
 *
 * @param {Result} result
 * @param {String} error message
 * @returns {AssertionError}
 * @api private
 */

function error(result: Result, message: string, expected?: string | number, actual?: string | number): AssertionError {
  const err = new AssertionError(`\`${result.cmd}\`: ${message}`);
  err.result = result;
  if (expected) err.expected = expected;
  if (actual) err.actual = actual;
  return err;
}
