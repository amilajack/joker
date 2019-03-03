import fs from 'fs';
import clone from 'clone';
import { spawn } from 'child_process';
import AssertionError from 'assertion-error';
import Batch, { BatchFunction, JokerError } from './batch';
import Environment from './environment';
import * as expect from './expectations';
import * as middlewares from './middlewares';
import Result, { Options, OptionalOptions, ResultError } from './result';
import * as respond from './respond';
import plugin, { Register } from './plugin';

/**
 * The default options for [[Runner]]. See [[Options]] for more details
 */
export const DEFAULT_OPTIONS: Options = {
  newLines: true,
  colors: true,
  showDiffs: true,
  showStdErr: true
};

/**
 * ## Hello World!
 *
 * ```ts
 * import Joker from '@amilajack/joker';
 *
 * await new Joker()
 *   .run('node --version')
 *   .stdout('v11.10.0')
 *   .end();
 * ```
 *
 * ### Preparing a test
 *
 * ```ts
 * import Joker from '@amilajack/joker';
 *
 * await new Joker()
 *   // Create the file before the test is run
 *   .exec(`echo "console.log('hello world')" > hello.js`)
 *   .run('node hello.js')
 *   .stdout('hello world')
 *   .end();
 * ```
 *
 * ### Setting up the environment
 *
 * ```ts
 * await new Joker()
 *   .cwd(path.join(__dirname, 'fixtures'))
 *   .env('NODE_ENV', 'production')
 *   .before('touch /tmp/test')
 *   .run('ls /tmp/')
 *   .stdout(/test/)
 *   .code(0)
 *   .end();
 * ```
 *
 * ### Custom expectations
 *
 * While Joker comes with built-in expectations, you can use your own too.
 *
 * ```js
 * await new Joker()
 *   .run('unicorns')
 *   .expect((result) => {
 *     if (result.stdout !== 'unicorns') {
 *       return new Error('NO!');
 *     }
 *   })
 *   .end();
 * ```
 *
 *
 * ### Usage with a test runner
 *
 * Joker plays nice with any test runner out there.
 *
 * #### Jest
 *
 * Here is a minimal example how you could use it with [Jest](http://jestjs.io) using async/await:
 *
 * ```js
 * describe('todo add', () => {
 *   it('adds a new todo item', async () => {
 *      const result = await new Joker()
 *        .run('todo add')
 *        .stdout('A new todo has been added')
 *        .end();
 *      expect(result.stdout).toMatchSnapshot();
 *    });
 * });
 * ```
 *
 * ### Options
 *
 * Joker can strip newlines and colors. You can tell it to do so by passing an
 * object that looks like this. Joker defaults to showing colors and new lines.
 *
 * ```js
 * const options = {
 *   colors: false,
 *   newLines: false
 * };
 *
 * new Joker(options)
 * ```
 */

export default class Runner {
  private batch: Batch = new Batch();

  private options: Options = DEFAULT_OPTIONS;

  private environment: Environment = new Environment();

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
  public register: (name: string | Register, fn?: Function) => Runner;

  public constructor(rawOptions: OptionalOptions = DEFAULT_OPTIONS) {
    const options: Options = Object.assign({}, this.options, rawOptions);
    if (!(this instanceof Runner)) return new Runner(options);
    this.options = options;
    this.register = plugin.bind(this);
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
   * @param fn - The function to be called
   * @returns instance for chaining
   * @see [[addBefore]]
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
   * @param fn - The function to be called
   * @returns instance for chaining
   * @see [[addAfter]]
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
   * @param path - The directory that the current working directory will be changed to
   * @returns instance for chaining
   */

  public cwd(cwdPath: string): Runner {
    this.batch.add(() => {
      if (!fs.existsSync(cwdPath)) {
        throw new Error(`The path "${cwdPath}" does not exist`);
      }
      this.environment.cwd = cwdPath;
    });
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
   *   .base('node')
   *   .run('--version')
   *   .stdout('11.10.1')
   *   .run(`-e "console.log('hello world')"`)
   *   .stdout('hello world')
   *   .end();
   * ```
   *
   * @param command - The base command that will prefix all subsequent commands
   * @returns instance for chaining
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
   *   .run('rev')
   *   .stdin('foobar')
   *   .stdout('raboof')
   *   .end();
   * ```
   *
   * @param data - The standard input that will be passed as to the `run` commands
   * @returns instance for chaining
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
   *   .stdout('11.10.1')
   *   .end();
   * ```
   *
   * @param key - The name of the environmental variable
   * @param value - The value of the environmental variable
   * @returns instance for chaining
   */

  public env(key: string, val: string | undefined): Runner {
    this.environment.env[key] = val;
    return this;
  }

  /**
   * Specify a command to run. Assertions will test the `stderr` and `stdout` from
   * the command registered with `run`.
   *
   * ### Basic example
   *
   * ```js
   * await new Joker()
   *   .run('node --version')
   *   .stdout('11.10.1')
   *   .end();
   * ```
   *
   * ### Running multiple `run` commands
   *
   * ```js
   * await new Joker()
   *   .run('node --version')
   *   .stdout('11.10.1')
   *   .run(`node -e "console.log('Hello World!')"`)
   *   .stdout('Hello World!')
   *   .end();
   * ```
   *
   * ```js
   *
   * await new Joker()
   *   .run('node --version')
   *   .stdout('11.10.1')
   *   .run('echo testing123')
   *   .stdout('testign123')
   *   .end();
   * ```
   *
   * @param command - The command to be executed and tested against
   * @returns instance for chaining
   * @see [[main]]
   */

  public run(cmd: string): Runner {
    this.expectations = [];
    this.batch.main(
      this.execFn(this.baseCmd === '' ? cmd : `${this.baseCmd} ${cmd}`)
    );
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
   * @param ms - The timeout in milliseconds
   * @returns instance for chaining
   */

  public timeout(ms: number): Runner {
    this.environment.timeout = ms;
    this.expect(expect.time(this.options));
    return this;
  }

  /**
   * Register a "stdout" expectation.
   *
   * ```js
   * await new Joker()
   *   .run('ls')
   *   .stdout('LICENSE Makefile')
   *   .end();
   * ```
   *
   * Works with regular expressions too.
   *
   * ```js
   * await new Joker()
   *   .run('time')
   *   .stdout(/system/)
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
   * @param pattern - The regular expression or string to test against
   * @returns instance for chaining
   */

  public stdout(pattern: RegExp | string): Runner {
    this.expect(expect.stdout(pattern, this.options));
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
   * @param pattern - The regular expression or string to test against
   * @returns instance for chaining
   */

  public stderr(pattern: RegExp | string): Runner {
    this.expect(expect.stderr(pattern, this.options));
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
   * @param code - The expected exit code
   * @returns instance for chaining
   */

  public code(code: number): Runner {
    this.expect(expect.code(code, this.options));
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
   * @param path - The path to check for existance
   * @returns instance for chaining
   */

  public exist(path: string): Runner {
    this.expect(expect.exists(path, this.options));
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
   * @param file - The path of the file who's contents we want to match against
   * @param pattern - The string or regular expression to match against
   * @returns instance for chaining
   */

  public match(file: string, pattern: RegExp | string): Runner {
    this.expect(expect.match(file, pattern, this.options));
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
   * @param path - The name of the folder we want to create
   * @returns instance for chaining
   */

  public mkdir(path: string): Runner {
    this.batch.add(middlewares.mkdir(path));
    return this;
  }

  /**
   * Execute a command that won't be tested. It is useful for running commands
   * that prepare the command that is tested with the `run` method.
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
   * @param cmd - The command you want to run
   * @param env - The configuration of the environment the test will be run in
   * @returns instance for chaining
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
   * @param path - The path you want to write to
   * @param data - The content to be written to the file
   * @returns instance for chaining
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
   * @param path - The path of the folder you want to remove
   * @returns instance for chaining
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
   * @param path - The path you want to write to unlink
   * @returns instance for chaining
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
   * @param pattern - The pattern to listen for
   * @returns instance for chaining
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
   * @param response - The response to send after an event has occured
   * @returns instance for chaining
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
   *   .run('echo a b c', (err) => {})
   *   .stdout('a b c')
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
   *   .run('echo a b c', (err) => {})
   *   .stdout('a b c')
   *   .end((err) => {});
   * ```
   *
   * @param fn - The callback to fire after all Joker jobs are finished
   * @returns instance for chaining
   */

  public end(fn?: (err?: JokerError) => void): void | Promise<JokerError> {
    if (!this.batch.hasMain()) {
      throw new Error(
        'Please provide a command to run. You may have forgotten to call `joker.run(myFunction)`'
      );
    }
    // If a callback is passed, run it. Otherwise, return a Promise
    if (fn) {
      return this.batch.run(fn);
    }
    return new Promise((resolve, reject) => {
      this.batch.run(err => {
        if (err instanceof AssertionError) {
          reject(err as JokerError);
        } else {
          resolve(err as JokerError);
        }
      });
    });
  }

  /**
   * Every `Joker` instance can be cloned, which allows you to build "templates" for tests. Here's some examples:
   *
   * ```js
   * const template = new Joker()
   *   .cwd(path.join(__dirname, 'fixtures'))
   *   .run('echo test');
   *
   * const test1 = await template
   *   .clone()
   *   .stdout(/test/)
   *   .end()
   *
   * const test2 = await template
   *   .clone()
   *   .stdout('test')
   *   .end();
   * ```
   *
   * @returns clone of the current instance
   */

  public clone(): Runner {
    return clone(this, false);
  }

  /**
   * Register an expectation
   *
   * ```js
   * import expect from 'expect';
   *
   * await new Joker()
   *   .run('ls')
   *   .expect((result) => {
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
   * @param fn - The custom assertion you want to register, takes [[Result]] as an argument
   * @returns instance for chaining
   */

  public expect(fn: expect.AssertionFn): Runner {
    this.expectations.push(fn);
    return this;
  }

  /**
   * Return a function that will execute
   * the command.
   *
   * @param cmd - The name of the command the returned function will be called by
   * @returns The a function that will execute the command
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

      const child = spawn(bin, args, this.environment.get());
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
