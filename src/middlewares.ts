/**
 * Core dependencies.
 */

import childProcess from 'child_process';

import fs from 'fs';

/**
 * Asynchronous mkdir(2).
 *
 * @param {String} path
 * @returns {Function} middleware
 * @see fs#mkdir
 * @api public
 */

export function mkdir(path: string) {
  return next => {
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
  return next => {
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

export function rmdir(path) {
  return next => {
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
  return next => {
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

export function exec(cmd: string, world) {
  return next => {
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

function done(next) {
  return err => {
    if (err) throw err;
    next();
  };
}

