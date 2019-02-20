import clone from 'clone';
import { spawn } from 'child_process';
import Batch from './batch';
import World from './world';
import * as expect from './expectations';
import * as middlewares from './middlewares';
import Result, { Options, JokerError } from './result';
import * as respond from './respond';
import { default as register } from './plugin';

type Fn = (a: Result | undefined | null | void) => void;

export type OptionalArgs = {
  newLines?: boolean;
  colors?: boolean;
};

/**
 * The primary entry point for every joker test. It provides public
 * interface that the users will interact with. Every `Runner` instance can
 * be cloned and this way one can build the so called "templates".
 *
 * Options:
 *
 *  - colors: default - true,       Strip colors from stdout and stderr when `false`
 *  - newLines: default - true,     Strip new lines from stdout and stderr when `false`
 *
 * Examples:
 *
 *  Instantiating the class:
 *  ```ts
 *  new Joker() // -> Runner
 *  ```
 *
 *  Simple stdout assertion:
 *  ```ts
 *  new Joker({ colors: false, newLines: false })
 *    .exec('todo clear')
 *    .exec('todo Buy milk')
 *    .run('todo ls')
 *    .stdout('Buy milk')
 *    .end(fn);
 *  ```
 *
 *  Stdout assertion:
 *  ```ts
 *  new Joker({ colors: false, newLines: false })
 *    .exec('todo clear')
 *    .run('todo')
 *    .stderr('Please enter a todo')
 *    .end(fn);
 *  ```
 *
 *  So repeating "todo clear" is simply ugly. You can avoid this by
 *  creating a "template".
 *  ```ts
 *  const todo = joker().before(clearTodos);
 *  ```
 *
 *  Later on:
 *  ```ts
 *  todo.clone().exec...
 *  ```
 *
 * For more examples check the "README" file.
 */

export default class Runner {
  batch: Batch = new Batch();

  options: Options = {
    newLines: true,
    colors: true
  };

  world: World = new World(process.env, process.cwd());

  expectations: Array<(res: Result) => undefined> = [];

  prompts: Array<RegExp | string> = [];

  responses: Array<string> = [];

  baseCmd: string = '';

  standardInput: null | string = null;

  register = register;

  constructor(rawOptions: OptionalArgs = {}) {
    const options: Options = Object.assign(
      {},
      this.options,
      rawOptions
    );
    if (!(this instanceof Runner)) return new Runner(options);
    this.options = options;
  }

  /**
   * Register a before filter.
   *
   * @param {Function} fn
   * @returns {Runner} for chaining
   * @see Batch#addBefore
   * @api public
   */

  public before(fn: expect.AssertionFn): Runner {
    this.batch.addBefore(fn);
    return this;
  }

  /**
   * Register an after filter.
   *
   * @param {Function} fn
   * @returns {Runner} for chaining
   * @see Batch#addAfter
   * @api public
   */

  public after(fn: expect.AssertionFn): Runner {
    this.batch.addAfter(fn);
    return this;
  }

  /**
   * Set the current working directory for
   * the command that will be executed.
   *
   * @param {String} path
   * @returns {Runner} for chaining
   * @api public
   */

  public cwd(path: string): Runner {
    this.world.cwd = path;
    return this;
  }

  /**
   * Specify a base command.
   *
   * Very convenient when testing the same executable
   * again and again.
   *
   * @param {String} command
   * @returns {Runner} for chaining
   * @api public
   */

  public base(cmd: string): Runner {
    this.baseCmd = cmd;
    return this;
  }

  /**
   * Set data to pass to stdin.
   *
   * @param {String} data
   * @returns {Runner} for chaining
   * @api public
   */

  public stdin(data: string): Runner {
    this.standardInput = data || '';
    return this;
  }

  /**
   * Set environment variable.
   *
   * @param {String} key
   * @param {String} value
   * @returns {Runner} for chaining
   * @api public
   */

  public env(key: string, val: any): Runner {
    this.world.env[key] = val;
    return this;
  }

  /**
   * Specify a command to run.
   *
   * @param {String} command
   * @returns {Runner} for chaining
   * @see Batch#main
   * @api public
   */

  public run(cmd: string, fn?: expect.AssertionFn): Runner {
    this.batch.main(this.execFn(this.baseCmd + cmd));
    if (fn) this.end(fn);
    return this;
  }

  /**
   * Force an execution timeout.
   *
   * @param {Number} ms
   * @returns {Runner} for chaining
   * @api public
   */

  public timeout(ms: number): Runner {
    this.world.timeout = ms;
    this.expect(expect.time(ms));
    return this;
  }

  /**
   * Register a "stdout" expectation.
   *
   * @param {Regex|String} pattern
   * @returns {Runner} for chaining
   * @api public
   */

  public stdout(pattern: RegExp | string): Runner {
    this.expect(expect.stdout(pattern));
    return this;
  }

  /**
   * Register a "stderr" expectation.
   *
   * @param {Regex|String} pattern
   * @returns {Runner} for chaining
   * @api public
   */

  public stderr(pattern: RegExp | string): Runner {
    this.expect(expect.stderr(pattern));
    return this;
  }

  /**
   * Register an exit code expectation.
   *
   * @param {Number} code
   * @returns {Runner} for chaining
   * @api public
   */

  public code(code: number): Runner {
    this.expect(expect.code(code));
    return this;
  }

  /**
   * Check if a file or a directory exists.
   *
   * @param {String} path
   * @returns {Runner} for chaining
   * @api public
   */

  public exist(path: string): Runner {
    this.expect(expect.exists(path));
    return this;
  }

  /**
   * Match the content of a file.
   *
   * @param {Regex|String} pattern
   * @returns {Runner} for chaining
   * @api public
   */

  public match(file: string, pattern: RegExp | string): Runner {
    this.expect(expect.match(file, pattern));
    return this;
  }

  /**
   * Create a new directory.
   *
   * @param {String} path
   * @returns {Runner} for chaining
   * @api public
   */

  public mkdir(path: string): Runner {
    this.batch.add(middlewares.mkdir(path));
    return this;
  }

  /**
   * Execute a command.
   *
   * @param {String} command
   * @param {World} world - env vars, cwd
   * @returns {Runner} for chaining
   * @api public
   */

  public exec(cmd: string, world?: World): Runner {
    world = world || this.world;
    this.batch.add(middlewares.exec(cmd, world));
    return this;
  }

  /**
   * Create a new file with the given `content`.
   *
   * @param {String} path
   * @param {String} data [optional]
   * @returns {Runner} for chaining
   * @api public
   */

  public writeFile(path: string, data: string): Runner {
    this.batch.add(middlewares.writeFile(path, data));
    return this;
  }

  /**
   * Remove a directory.
   *
   * @param {String} path
   * @returns {Runner} for chaining
   * @api public
   */

  public rmdir(path: string): Runner {
    this.batch.add(middlewares.rmdir(path));
    return this;
  }

  /**
   * Remove a file.
   *
   * @param {String} path
   * @returns {Runner} for chaining
   * @api public
   */

  public unlink(path: string): Runner {
    this.batch.add(middlewares.unlink(path));
    return this;
  }

  /**
   * Register an interactive prompt
   *
   * @param {Regex|String} pattern
   * @returns {Runner} for chaining
   * @api public
   */

  public on(pattern: RegExp | string): Runner {
    this.prompts.push(pattern);
    return this;
  }

  /**
   * Register an interactive prompt response
   *
   * @param {String} response
   * @returns {Runner} for chaining
   * @api public
   */

  public respond(response: string): Runner {
    this.responses.push(response);
    return this;
  }

  /**
   * Run the test.
   *
   * @param {Function} fn
   * @returns {Runner} for chaining
   * @api public
   */

  public end(fn: (err?: Error) => void) {
    if (!this.batch.hasMain()) {
      throw new Error('Please provide a command to run. Hint: `joker#run`');
    }
    this.batch.run(fn);
  }

  /**
   * Clone the runner. Give basic support for templates.
   *
   * @returns {Runner} clone of the current instance
   * @api public
   */

  public clone(): Runner {
    return clone(this, false);
  }

  /**
   * Register an expectation.
   *
   * @param {Function} fn
   * @api public
   */

  public expect(fn: expect.AssertionFn): Runner {
    this.expectations.push(fn);
    return this;
  }

  /**
   * Return a function that will execute
   * the command.
   *
   * @returns {Function}
   * @api private
   */

  private execFn(cmd: string): (fn: Fn) => void {
    const args = require('shell-quote').parse(cmd);
    const bin = args.shift(0);

    return ((fn: Fn) => {
      // Allow .run('') without attempting
      if (cmd === '') {
        fn(undefined);
        return;
      }

      const child = spawn(bin, args, {
        env: this.world.env,
        cwd: this.world.cwd
      });
      let stdout = '';
      let stderr = '';
      let timeoutError: JokerError | undefined;

      if (this.standardInput != null) {
        child.stdin.end(this.standardInput);
      }

      if (this.world.timeout) {
        setTimeout(() => {
          child.kill();
          timeoutError = { killed: true, code: 1 };
        }, this.world.timeout);
      }

      respond.run(child.stdout, child.stdin, this.prompts, this.responses);

      child.stdout.on('data', (data: string) => {
        stdout += data;
      });
      child.stderr.on('data', (data: string) => {
        stderr += data;
      });

      child.on('close', (code: number) => {
        const result = new Result(cmd, code, this.options).parse(
          stdout,
          stderr,
          timeoutError
        );

        let error = null;

        for (let i = 0, len = this.expectations.length; i < len; i++) {
          error = this.expectations[i](result);
          if (error) break;
        }

        fn(error);
      });
    });
  }
}
