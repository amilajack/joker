/**
 * Simple object that contains the result
 * of command executions.
 */

export type Options = {
  newLines: boolean,
  colors: boolean
};

type Error = {
  code: number,
  killed: boolean
};

export default class Result {
  cmd: string;

  code: number;

  options: Options;

  stdout: string;

  stderr: string;

  killed: boolean;

  err: Error;

  constructor(cmd: string, code: number, options: Options = { colors: true, newLines: true }) {
    this.options = options;
    this.code = code;
    this.cmd = cmd;
  }

  /**
   * Normalize the command-line result.
   *
   * @param {String} stdout
   * @param {String} stderr
   * @returns {Result} self
   * @api public
   */

  parse(stdout: string, stderr: string, err: Error): Result {
    this.err = err;
    this.code = err ? err.code : this.code;
    this.killed = err && err.killed;
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
   * @returns {String}
   * @api private
   */

  strip(str: string): string {
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
