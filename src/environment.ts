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

export interface EnvironmentProperties {
  env: ProcessEnv;
  cwd: string;
}

export default class Environment {
  public env: ProcessEnv;

  public cwd: string;

  public timeout: null | number = null;

  public constructor(
    env: ProcessEnv = process.env,
    cwd: string = process.cwd()
  ) {
    this.env = env || Object.assign({}, process.env);
    this.cwd = cwd;
  }

  /**
   * Get the properties of the [[Environment]] class
   * @returns The properties of the [[Environment]] class
   */
  public get(): EnvironmentProperties {
    return {
      env: this.env,
      cwd: this.cwd
    };
  }
}
