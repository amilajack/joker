import { DEFAULT_OPTIONS } from './runner';

/**
 * Simple object that contains the result
 * of command executions.
 */

export interface Options {
  /**
   * Strip new lines from stdout and stderr when `false`
   */
  newLines: boolean;

  /**
   * Strip colors from stdout and stderr when `false`
   */
  colors: boolean;

  /**
   * Determine if diffs should be shown with the [[Runner.stdout]] and [[Runner.stdout]] methods
   */
  showDiffs: boolean;

  /**
   * If there is a stderr, show it to the user
   */
  showStdErr: boolean;
}

/**
 * @see [[Options]] for more details
 */
export interface OptionalOptions {
  newLines?: boolean;
  colors?: boolean;
  showDiffs?: boolean;
}

export interface ResultError {
  code: number;
  killed: boolean;
}

export default class Result {
  public cmd: string = '';

  public code: number = 0;

  private options: Options = DEFAULT_OPTIONS;

  public stdout: string = '';

  public stderr: string = '';

  public killed: boolean = false;

  public err: ResultError;

  public constructor(
    cmd: string,
    code: number,
    options: Options = DEFAULT_OPTIONS
  ) {
    this.options = options;
    this.code = code;
    this.cmd = cmd;
  }

  /**
   * Normalize the command-line result.
   *
   * @param {String} stdout
   * @param {String} stderr
   */

  public parse(
    stdout: string,
    stderr: string,
    err: ResultError | undefined
  ): Result {
    if (err) {
      this.err = err;
      this.killed = err && err.killed;
    }
    this.code = err ? err.code : this.code;
    this.stdout = this.strip(stdout);
    this.stderr = this.strip(stderr);
    return this;
  }

  /**
   * `Result#strip` will do the following:
   *
   * - Remove the last new line symbol from the string (always)
   * - Strip new lines (optional, see `options`)
   * - Strip colors (optional, see `options`)
   *
   * Acknowledgments:
   *
   *  - StripColorCodes - MIT License
   *
   * @param {String} str
   * @private
   */

  public strip(str: string): string {
    str = str.replace(/\r?\n$/, '');

    if (this.options.newLines === false) {
      str = str.replace(/\r?\n/g, '');
    }

    if (this.options.colors === false) {
      str = str.replace(/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]/g, '');
    }

    return str;
  }
}
