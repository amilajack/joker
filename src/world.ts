/**
 * Contain the environment variables and the
 * current working directory for commands.
 *
 * @param {Object} env
 * @param {String} cwd
 * @private
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

  /**
   * Get the properties of the `World` class
   */
  public getOptions() {
    return {
      env: this.env,
      cwd: this.cwd
    }
  }
}
