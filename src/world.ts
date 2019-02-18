/**
 * Contain the environment variables and the
 * current working directory for commands.
 *
 * @param {Object} env
 * @param {String} cwd
 * @constructor
 */

export default class World {
  env: Object;

  cwd: string;

  timeout: null | number = null;

  constructor(env: Object = process.env, cwd: string = process.cwd()) {
    this.env = env || Object.assign({}, process.env);
    this.cwd = cwd;
  }
}
