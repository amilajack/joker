import childProcess from 'child_process';
import fs from 'fs';
import { AssertionError } from 'assert';
import World from './world';

/**
 * Asynchronous mkdir(2).
 *
 * @param {String} path
 * @returns {Function} middleware
 * @see fs#mkdir
 * @api public
 */
type Fn = () => void;

export function mkdir(path: string) {
  return (next: Fn) => {
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
 * @api public
 */

export function writeFile(path: string, data: string) {
  return (next: Fn) => {
    fs.writeFile(path, data, done(next));
  };
}

/**
 * Asynchronous rmdir(2).
 *
 * @param {String} path
 * @returns {Function} middleware
 * @see fs#rmdir
 * @api public
 */

export function rmdir(path: string) {
  return (next: Fn) => {
    fs.rmdir(path, done(next));
  };
}

/**
 * Asynchronous unlink(2).
 *
 * @param {String} path
 * @returns {Function} middleware
 * @see fs#unlink
 * @api public
 */

export function unlink(path: string) {
  return (next: Fn) => {
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
 * @api public
 */

export function exec(cmd: string, world: World) {
  return (next: Fn) => {
    childProcess.exec(cmd, world, next);
  };
}

/**
 * Callback generator for middlewares. Throw errors if any.
 *
 * @param {Function} next
 * @returns {Function}
 * @api public
 */

function done(next: Fn) {
  return (err: AssertionError) => {
    if (err) throw err;
    next();
  };
}

