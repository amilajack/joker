import fs from 'fs';
import AssertionError from 'assertion-error';
import expect from 'expect';
import Result, { Options } from './result';

export type AssertionFn = (res: Result) => AssertionError | void;

export type AssertionErrorAdditions = AssertionError & {
  expected?: string | number | RegExp;
  actual?: string | number;
  result: Result;
};

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
 * @private
 */

function error(
  result: Result,
  message: string,
  options: Options,
  expected?: string | number | RegExp,
  actual?: string | number
): AssertionErrorAdditions {
  const err: AssertionErrorAdditions = new AssertionError(
    `\`${result.cmd}\`: ${message}`
  );
  err.result = result;
  if (expected) err.expected = expected;
  if (actual) err.actual = actual;

  // Use expect to show diffs between actual and expected values
  if (options.showDiffs) {
    if (typeof expected === 'string' || typeof expected === 'number') {
      try {
        expect(actual).toEqual(expected);
      } catch (e) {
        console.log(e.message);
      }
    }
  }

  // Show the stdout if the command errored
  if (result.stderr && options.showStdErr) console.log(result.stderr);

  return err;
}

/**
 * Assert stdout or stderr.
 *
 * @param {String} stdout/stderr
 * @param {Mixed} expected
 * @param {Result} result
 * @private
 */

function assertOut(
  key: string,
  expected: RegExp | string | number,
  result: Result,
  options: Options
): AssertionErrorAdditions | void {
  const actual = result[key];
  const statement =
    expected instanceof RegExp ? expected.test(actual) : expected === actual;

  if (statement !== true) {
    const message = `Expected ${key} to match "${expected}". Actual: "${actual}"`;
    return error(result, message, options, expected, actual);
  }
}

/**
 * Return no timeout expectation.
 *
 * @private
 */

export function time(options: Options): AssertionFn {
  return (result: Result): AssertionErrorAdditions | undefined => {
    return result.killed
      ? error(result, 'Command execution terminated (timeout)', options)
      : undefined;
  };
}

/**
 * Return an exit code expectation.
 *
 * @param {Number} expected exit code.
 * @private
 */

export function code(code: number, options: Options): AssertionFn {
  return (result: Result) => {
    if (code !== result.code) {
      const message = `Expected exit code: "${code}", actual: "${result.code}"`;
      return error(result, message, options, code, result.code);
    }
    return undefined;
  };
}

/**
 * Return a stderr expectation.
 *
 * @param {String|RegExp} expected string or regular express to match
 * @private
 */

export function stderr(
  expected: string | RegExp,
  options: Options
): AssertionFn {
  return (result: Result) => assertOut('stderr', expected, result, options);
}

/**
 * Return a stdout expectation.
 *
 * @param {String|RegExp} expected string or regular express to match
 * @private
 */

export function stdout(
  expected: string | RegExp,
  options: Options
): AssertionFn {
  return (result: Result) => assertOut('stdout', expected, result, options);
}

/**
 * Verify that a `path` exists.
 *
 * @param {String} path
 * @private
 */

export function exists(path: string, options: Options): AssertionFn {
  return (result: Result): AssertionErrorAdditions | undefined => {
    if (fs.existsSync(path) !== true) {
      return error(result, `Expected "${path}" to exist.`, options);
    }
    return undefined;
  };
}

/**
 * Verify that `path`'s data matches `data`.
 *
 * @param {String} path
 * @param {String|RegExp} data
 * @private
 */

export function match(
  path: string,
  data: string | RegExp,
  options: Options
): AssertionFn {
  return (result: Result): AssertionErrorAdditions | undefined => {
    const contents = fs.readFileSync(path, { encoding: 'utf8' });
    const statement =
      data instanceof RegExp ? data.test(contents) : data === contents;

    if (statement !== true) {
      const message = `Expected "${path}" to match "${data}", but it was: "${contents}"`;
      return error(result, message, options, data, contents);
    }

    return undefined;
  };
}
