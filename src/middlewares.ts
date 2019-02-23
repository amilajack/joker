import childProcess from 'child_process';
import fs from 'fs';
import { AssertionError } from 'assert';
import World from './world';

export type NextFn = () => void;

export type ReturnFn = (next: NextFn) => void;

/**
 * Callback generator for middlewares. Throw errors if any.
 *
 * @param {Function} next
 * @private
 */

function done(next: NextFn): (err: AssertionError) => void {
  return err => {
    if (err) throw err;
    next();
  };
}

/**
 * Asynchronous mkdir(2).
 *
 * @param {String} path
 * @returns {Function} middleware
 * @see fs#mkdir
 * @private
 */
export function mkdir(path: string): ReturnFn {
  return (next: NextFn) => {
    fs.mkdir(path, done(next));
  };
}

/**
 * Asynchronously writes data to a file, replacing the file if it already exists.
 * `data` can be a string or a buffer.
 *
 * @param {String} path
 * @param {Buffer|String} data
 * @returns {Function} middleware
 * @see fs#writeFile
 * @private
 */

export function writeFile(path: string, data: string): ReturnFn {
  return (next: NextFn) => {
    fs.writeFile(path, data, done(next));
  };
}

/**
 * Asynchronous rmdir(2).
 *
 * @param {String} path
 * @returns {Function} middleware
 * @see fs#rmdir
 * @private
 */

export function rmdir(path: string): ReturnFn {
  return (next: NextFn) => {
    fs.rmdir(path, done(next));
  };
}

/**
 * Asynchronous unlink(2).
 *
 * @param {String} path
 * @returns {Function} middleware
 * @see fs#unlink
 * @private
 */

export function unlink(path: string): ReturnFn {
  return (next: NextFn) => {
    fs.unlink(path, done(next));
  };
}

/**
 * Run a command in a shell.
 *
 * @param {String} the command to run
 * @param {String} cwd
 * @returns {Function} middleware
 * @see child_process#exec
 * @private
 */

export function exec(cmd: string, world: World): ReturnFn {
  return (next: NextFn) => {
    childProcess.exec(cmd, world.getOptions(), next);
  };
}
