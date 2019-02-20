/**
 * Contain the environment variables and the
 * current working directory for commands.
 *
 * @param {Object} env
 * @param {String} cwd
 * @constructor
 */

export interface ProcessEnv {
  [key: string]: string | undefined;
}

export default class World {
  env: ProcessEnv;

  cwd: string;

  timeout: null | number = null;

  constructor(env: ProcessEnv = process.env, cwd: string = process.cwd()) {
    this.env = env || Object.assign({}, process.env);
    this.cwd = cwd;
  }
}
