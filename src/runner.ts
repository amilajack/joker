import clone from 'clone';
import { spawn } from 'child_process';
import Batch, { BatchFunction, JokerError } from './batch';
import Environment from './environment';
import * as expect from './expectations';
import * as middlewares from './middlewares';
import Result, { Options, OptionalOptions, ResultError } from './result';
import * as respond from './respond';
import { default as register } from './plugin';

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
 *  Simple stdout assertion:
 *  ```ts
 *  await new Joker({ colors: false, newLines: false })
 *    .exec('todo clear')
 *    .exec('todo Buy milk')
 *    .run('todo ls')
 *    .stdout('Buy milk')
 *    .end();
 *  ```
 *
 *  Stdout assertion:
 *  ```ts
 *  await new Joker({ colors: false, newLines: false })
 *    .exec('todo clear')
 *    .run('todo')
 *    .stderr('Please enter a todo')
 *    .end();
 *  ```
 *
 *  So repeating "todo clear" is simply ugly. You can avoid this by
 *  creating a "template".
 *  ```ts
 *  const todo = new Joker().before(clearTodos);
 *  ```
 *
 *  Later on:
 *  ```ts
 *  todo.clone().exec...
 *  ```
 *
 * For more examples check the "README" file.
 */

export const DEFAULT_OPTIONS = {
  newLines: true,
  colors: true,
  showDiffs: true
};

export default class Runner {
  private batch: Batch = new Batch();

  private options: Options = DEFAULT_OPTIONS;

  private environment: Environment = new Environment(
    process.env,
    process.cwd()
  );

  private expectations: (expect.AssertionFn)[] = [];

  private prompts: (RegExp | string)[] = [];

  private responses: string[] = [];

  private baseCmd: string = '';

  private standardInput: null | string = null;

  /**
   * Joker has primitive support for plugins. You can register any expectation or/and
   * any middleware by calling `joker.register`.
   *
   *  ```js
   *  const fn = () => {};
   *  new Joker().register('foo', fn);
   *  ```
   *
   *  Or you may want to register many functions at once.
   *
   *  ```js
   *  const fn = () => {};
   *  const fn1 = () => {};
   *  joker.register({ baz: fn, bar: fn1 });
   *  ```
   */
  public register = register;

  public constructor(rawOptions: OptionalOptions = DEFAULT_OPTIONS) {
    const options: Options = Object.assign({}, this.options, rawOptions);
    if (!(this instanceof Runner)) return new Runner(options);
    this.options = options;
  }

  /**
   * Register a `before` filter.
   *
   * ```js
   * await new Joker()
   *   .before(fn)
   *   .before(fn2)
   *   .run(cmd)
   *   .end();
   * ```
   *
   * @param {Function} fn
   * @returns for chaining
   * @see [[Batch#addBefore]]
   */

  public before(fn: BatchFunction): Runner {
    this.batch.addBefore(fn);
    return this;
  }

  /**
   * Register an `after` filter.
   *
   * ```js
   * await new Joker()
   *   .run(cmd)
   *   .after(fn)
   *   .after(fn2)
   *   .end();
   * ```
   *
   * @param {Function} fn
   * @returns for chaining
   * @see [[Batch#addAfter]]
   */

  public after(fn: BatchFunction): Runner {
    this.batch.addAfter(fn);
    return this;
  }

  /**
   * Set the current working directory for
   * the command that will be executed.
   *
   * Change the current working directory of the main command (specified with `run`).
   * Please note that this won't affect any other commands like `unlink` etc.
   *
   * ```js
   * await new Joker()
   *   .cwd(__dirname)
   *   .run('pwd')
   *   .stdout(/test$/)
   *   .end();
   * ```
   *
   * @param {String} path
   * @returns for chaining
   */

  public cwd(path: string): Runner {
    this.environment.cwd = path;
    return this;
  }

  /**
   * Specify a base command.
   *
   * Very convenient when testing the same executable
   * again and again.
   *
   * ```js
   * await new Joker()
   *   .base('node ')
   *   .run('--version')
   *   .stdout('0.10.16')
   *   .end();
   * ```
   *
   * @param {String} command
   * @returns for chaining
   */

  public base(cmd: string): Runner {
    this.baseCmd = cmd;
    return this;
  }

  /**
   * Set data to pass to stdin
   *
   * ```js
   * await new Joker()
   *   .stdin('foobar')
   *   .run('rev')
   *   .stdout('raboof')
   *   .end();
   * ```
   *
   * @param {String} data
   * @returns for chaining
   */

  public stdin(data: string): Runner {
    this.standardInput = data || '';
    return this;
  }

  /**
   * Set environment variable.
   *
   * ```js
   * await new Joker()
   *   .env('foo', 'bar')
   *   .env('baz', 'boo')
   *   .run('node --version')
   *   .stdout('0.10.16')
   *   .end();
   * ```
   *
   * @param {String} key
   * @param {String} value
   * @returns for chaining
   */

  public env(key: string, val: string | undefined): Runner {
    this.environment.env[key] = val;
    return this;
  }

  /**
   * Specify a command to run.
   *
   * ```js
   * await new Joker()
   *   .run('node --version')
   *   .stdout('0.10.16')
   *   .end();
   * ```
   *
   * You could also run the test right after specifying the command to run:
   *
   * ```js
   * await new Joker()
   *   .stdout('0.10.16')
   *   .run('node --version', fn);
   * ```
   *
   * @param {String} command
   * @returns for chaining
   * @see [[Batch#main]]
   */

  public run(cmd: string, fn?: BatchFunction): Runner {
    this.expectations = [];
    this.batch.main(this.execFn(this.baseCmd + cmd));
    if (fn) this.end(fn);
    return this;
  }

  /**
   * Set a timeout for the main command that you are about to test
   *
   * ```js
   * await new Joker()
   *   .timeout(1) // ms
   *   .run('cat /dev/null')
   *   .end();
   * ```
   *
   * @param {Number} ms
   * @returns for chaining
   */

  public timeout(ms: number): Runner {
    this.environment.timeout = ms;
    this.expect(expect.time());
    return this;
  }

  /**
   * Register a "stdout" expectation.
   *
   * ```js
   * await new Joker()
   *   .stdout('LICENSE Makefile')
   *   .run('ls')
   *   .end();
   * ```
   *
   * Works with regular expressions too.
   *
   * ```js
   * await new Joker()
   *   .stdout(/system/)
   *   .run('time')
   *   .end();
   * ```
   *
   * You can also combine regular expressions and string assertions
   *
   * ```ts
   * await new Joker()
   *   .run('echo foo')
   *   // Test for an exact string
   *   .stdout('foo')
   *   // Test using a regular expression
   *   .stdout(/foo/)
   *   .done();
   * ```
   *
   * @param {Regex|String} pattern
   * @returns for chaining
   */

  public stdout(pattern: RegExp | string): Runner {
    this.expect(expect.stdout(pattern));
    return this;
  }

  /**
   * Register a "stderr" expectation.
   *
   * ```js
   * await new Joker()
   *   .run('todo add')
   *   .stderr('Please specify a todo')
   *   .end();
   * ```
   *
   * @param {Regex|String} pattern
   * @returns for chaining
   */

  public stderr(pattern: RegExp | string): Runner {
    this.expect(expect.stderr(pattern));
    return this;
  }

  /**
   * Assert that a specific exit code is thrown.
   *
   * ```js
   * await new Joker()
   *   .run('todo add')
   *   .code(1)
   *   .end();
   * ```
   *
   * @param {Number} code
   * @returns for chaining
   */

  public code(code: number): Runner {
    this.expect(expect.code(code));
    return this;
  }

  /**
   * Check if a file or a directory exists.
   *
   * ```js
   * await new Joker()
   *   .run('mkdir /tmp/test')
   *   .exist('/tmp/test')
   *   .end();
   * ```
   *
   * @param {String} path
   * @returns for chaining
   */

  public exist(path: string): Runner {
    this.expect(expect.exists(path));
    return this;
  }

  /**
   * Match the content of a file.
   *
   * You can match the contexts against an exact string
   *
   * ```js
   * await new Joker()
   *   .writeFile(file, 'Hello')
   *   .run('node void.js')
   *   .match(file, 'Hello')
   *   .unlink(file)
   *   .end(done);
   * ```
   *
   * You can also match against a regular expression
   *
   * ```js
   * await new Joker()
   *   .writeFile(file, 'Hello')
   *   .run('node void.js')
   *   .match(file, /ello/)
   *   .unlink(file)
   *   .end(done);
   * ```
   *
   * @param {Regex|String} pattern
   * @returns for chaining
   */

  public match(file: string, pattern: RegExp | string): Runner {
    this.expect(expect.match(file, pattern));
    return this;
  }

  /**
   * Create a new directory.
   *
   * ```js
   * await new Joker()
   *   .mkdir('xml-database')
   *   .run('this does stuff with the xml-database directory')
   *   .end();
   * ```
   *
   * @param {String} path
   * @returns for chaining
   */

  public mkdir(path: string): Runner {
    this.batch.add(middlewares.mkdir(path));
    return this;
  }

  /**
   * Execute a command.
   *
   * ```js
   * await new Joker()
   *   .writeFile('LICENSE', 'MIT License')
   *   .exec('git add -a')
   *   .exec('git commit -m "Add LICENSE"')
   *   .run('git log')
   *   .stdout(/LICENSE/)
   *   .end();
   * ```
   *
   * By default the commands will inherit the "environment" for the main command which
   * includes environment variables, cwd, timeout. However, you can override this by
   * supplying a different "environment":
   *
   * ```js
   * await new Joker()
   *   .exec('git add LICENSE', { timeout: 4, cwd: '/tmp' })
   *   .run('git log')
   *   .stdout(/LICENSE/)
   *   .end();
   * ```
   *
   * @param {String} command
   * @param {Environment} env - env vars, cwd
   * @returns for chaining
   */

  public exec(cmd: string, env?: Environment): Runner {
    env = env || this.environment;
    this.batch.add(middlewares.exec(cmd, env));
    return this;
  }

  /**
   * Create a new file with the given `content`. This is a small wrapper over `fs.writeFile`.
   *
   * Without content:
   *
   * ```js
   * await new Joker()
   *   .writeFile(pathToFile)
   *   .end();
   * ```
   *
   * With content:
   *
   * ```js
   * await new Joker()
   *   .writeFile(pathToFile, data)
   *   .end();
   * ```
   *
   * @param {String} path
   * @param {String} data [optional]
   * @returns for chaining
   */

  public writeFile(path: string, data: string): Runner {
    this.batch.add(middlewares.writeFile(path, data));
    return this;
  }

  /**
   * Remove a directory
   *
   * ```js
   * await new Joker()
   *   .mkdir('xml-database')
   *   .run('this does stuff with the xml-database directory')
   *   .rmdir('xml-database')
   *   .end();
   * ```
   *
   * @param {String} path
   * @returns for chaining
   */

  public rmdir(path: string): Runner {
    this.batch.add(middlewares.rmdir(path));
    return this;
  }

  /**
   * Remove a file
   *
   * ```js
   * await new Joker()
   *   .writeFile('my-file', data)
   *   .run('this does stuff with my file')
   *   .unlink('my-file')
   *   .end();
   * ```
   *
   * @param {String} path
   * @returns for chaining
   */

  public unlink(path: string): Runner {
    this.batch.add(middlewares.unlink(path));
    return this;
  }

  /**
   * Register an interactive prompt
   *
   * Detect a prompt for user input. Accepts a String or RegExp that appears in
   * the the stdout stream. Must be paired with `.respond`.
   *
   * ```js
   * await new Joker()
   *   .run(cmd)
   *   .on('Your name: ')
   *   .respond('Joe User\n')
   *   .end();
   * ```
   *
   * @param {Regex|String} pattern
   * @returns for chaining
   */

  public on(pattern: RegExp | string): Runner {
    this.prompts.push(pattern);
    return this;
  }

  /**
   * Register an interactive prompt response
   *
   * In more detail, this method writes a response to the stdin stream when a prompt is detected
   *
   * ```js
   * await new Joker()
   *   .run(cmd)
   *   .on('Your name: ')
   *   .respond('Joe User\n')
   *   .end();
   * ```
   *
   * @param {String} response
   * @returns for chaining
   */

  public respond(response: string): Runner {
    this.responses.push(response);
    return this;
  }

  /**
   * Run the given test
   *
   * If no argument is passed, a Promise is returned
   *
   * ```js
   * const result = await new Joker()
   *   .stdout('a b c')
   *   .run('echo a b c', (err) => {})
   *   .end();
   *
   * expect(result.message).toEqual(
   *   'this err message is only shown after Joker is finished running'
   * );
   * ```
   *
   * You can also pass callback functions if you would like. This will not return a Promise.
   *
   * ```js
   * await new Joker()
   *   .run('echo a b c')
   *   .stdout('a b c')
   *   .end((err) => {});
   * ```
   *
   * The same might be accomplished with supplying a function to `run`:
   *
   * ```js
   * await new Joker()
   *   .stdout('a b c')
   *   .run('echo a b c', (err) => {})
   *   .end((err) => {});
   * ```
   *
   * @param {Function} fn
   * @returns for chaining
   */

  public end(
    fn?: (err?: JokerError) => void
  ): void | Promise<JokerError | void> {
    if (!this.batch.hasMain()) {
      throw new Error(
        'Please provide a command to run. Hint: You may have forgotten to call `joker.run(myFunction)`'
      );
    }
    // If a callback is passed, run it. Otherwise, return a Promise
    if (fn) {
      return this.batch.run(fn);
    }
    return new Promise(resolve => {
      this.batch.run(err => {
        resolve(err as JokerError);
      });
    });
  }

  /**
   * Deep clone the `Runner` instance. Give basic support for templates.
   *
   * ```js
   * const clone = new Joker()
   *   .before(fn)
   *   .after(fn)
   *   .run('my awesome command')
   *   .end()
   *   .clone();
   * ```
   *
   * @returns clone of the current instance
   */

  public clone(): Runner {
    return clone(this, false);
  }

  /**
   * Register an expectation.
   *
   * ```js
   * import expect from 'expect';
   *
   * await new Joker()
   *   .run('ls')
   *   .expect((result: Result) => {
   *     if (result.stdout !== 'Unicorns') {
   *       return new Error('OMG');
   *     }
   *     expect(res.stderr).toEqual('');
   *     expect(res.stdout).toEqual('Unicorns');
   *     expect(result.code).toEqual(0);
   *     expect(result.killed).toEqual(false);
   *   })
   *   .end();
   * ```
   *
   * @param {Function} fn
   */

  public expect(fn: expect.AssertionFn): Runner {
    this.expectations.push(fn);
    return this;
  }

  /**
   * Return a function that will execute
   * the command.
   *
   * @returns
   */

  private execFn(cmd: string): (fn: Function) => void {
    const args = require('shell-quote').parse(cmd);
    const bin = args.shift(0);

    return (fn: Function) => {
      // Allow .run('') without attempting
      if (cmd === '') {
        fn(undefined);
        return;
      }

      const child = spawn(bin, args, this.environment.getOptions());
      let stdout = '';
      let stderr = '';
      let timeoutError: ResultError | undefined;

      if (this.standardInput !== null) {
        child.stdin.end(this.standardInput);
      }

      if (this.environment.timeout) {
        setTimeout(() => {
          child.kill();
          timeoutError = { killed: true, code: 1 };
        }, this.environment.timeout);
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
    };
  }
}
