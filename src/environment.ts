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

export interface OptionalEnvironmentProperties {
  env?: ProcessEnv;
  cwd?: string;
  timeout?: number;
}

export interface EnvironmentProperties {
  env: ProcessEnv;
  cwd: string;
  timeout: number | undefined;
}

export default class Environment {
  /**
   * The environmental varibles that are defined in the environment which
   * commands are tested in. By default, `process.env` is used. However,
   * if [[Environment]] is constructed with a custom env, that will be used
   * instead and `process.env` will not be used.
   */
  public env: ProcessEnv = {
    ...process.env,
    NODE_ENV: 'test'
  };

  /**
   * The current working directory that a command is tested in. Defaults to
   * `process.cwd()`
   */
  public cwd: string = process.cwd();

  /**
   * The timeout between the execution of `run` commands
   */
  public timeout: undefined | number = undefined;

  public constructor(options: OptionalEnvironmentProperties = {}) {
    this.env = Object.assign({}, options.env || process.env);
    this.cwd = options.cwd || process.cwd();
    this.timeout = options.timeout;
  }

  /**
   * Get the properties of the [[Environment]] class
   * @returns The properties of the [[Environment]] class
   */
  public get(): EnvironmentProperties {
    return {
      env: this.env,
      cwd: this.cwd,
      timeout: this.timeout
    };
  }
}
