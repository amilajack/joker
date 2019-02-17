> ## 🛠 Status: In Development
> Joker is currently in development. It's on the fast track to a 1.0 release, so we encourage you to use it and give us your feedback, but there are things that haven't been finalized yet and you can expect some changes.

[![Build Status](https://travis-ci.com/amilajack/joker.svg)](http://travis-ci.com/amilajack/joker)

## Synopsis

Simple and powerful end-to-end testing for command-line apps.

## Description

joker is aiming to make testing of command-line apps as simple as possible. It
plays nice with the testing tools that you are already using and in case you are
one of those devs who practice outside-in BDD, it has the potential to become
something that lives in every command-line app that you are going to build.

### How it looks

```js
import Joker from '@amilajack/joker';

new Joker()
  .exec('touch /tmp/test')
  .run('ls /tmp/')
  .stdout(/test/)
  .end();
```

### Formatting options

joker can strip newlines and colors. You can tell it to do so by passing an
object that looks like this:

```js
const options = {
  colors: false,
  newlines: false,
};

Joker(options).stdout...
```

### Custom expectations

While joker comes with built-in expectations, you can use your own too.

```js
new Joker()
  .expect(function(result) {
    if (result.stdout !== 'unicorns') {
      return new Error('NO!');
    }
  })
  .run('unicorns')
  .end(fn);
```

### Custom middlewares

You can register as many before and after middlewares as you wish.

```js
new Joker()
  .before(setupDatabase)
  .before(runMigrations)
  .run(cmd)
  .after(downgradeCron)
  .after(deleteDatabase)
  .end();
```

### Middleware order

The Middleware execution order is very simple - "before" middlewares always run
before everything else, "after" middlewares always run after everything else.
The other middlewares will match the order that you have specified.

```js
new Joker()
  .before(before1)
  .before(before2)
  .after(after1)
  .after(after2)
  .writeFile(file, '')
  .run(cmd)
  .unlink(file)
  .end(fn);

// Execution order:
// before1, before2, writeFile, cmd, unlink, after1, after2
```

You may also want to reuse before and after middlewares as much as possible,
especially when testing something that requires extensive setup and cleanup. You
can accomplish this by cloning a joker instance.

```js
const base = new Joker()
  .before(setupDatabase)
  .after(removeDatabase);

// Later on

base.clone().run....
```

### Plugins

joker has primitive support for plugins. You can register any expectation or/and
any middleware by calling `joker.register`.

```js
const fn = function() {};
new Joker().register('foo', fn);
```

Or you may want to register many functions at once.

```js
const fn = function() {};
const fn1 = function() {};
joker.register({ baz: fn, bar: fn1 });
```

### Usage with a test runner

joker plays nice with any test runner out there. Here is a minimal example how
you could use it with Mocha.

```js
describe('todo add', function() {
  it('adds a new todo item', function(done) {
    new Joker()
      .run('todo add')
      .stdout('A new todo has been added')
      .end(done);
  });
});
```

### Usage without a test runner

While using a test runner is recommended joker is completely 'nodeable'. Here is
a simple example how you could accomplish that:

```js
const assert = require('assert');

function refute(err) {
  assert(!err);
}

new Joker()
  .run(cmd)
  .end(refute);

new Joker()
  .run(anotherCmd)
  .end(refute);
```

### Responding to interactive prompts

joker can respond to apps that run interactively using the `on()` and
`respond()` functions.

```js
new Joker()
  .run(cmd)
  .on('Your name: ')
  .respond('Joe User\n')
  .end();
```

See `test/prompt.test.js` for more examples.

## API

### #before

Register a "before" middleware.

```js
new Joker()
  .before(fn)
  .before(fn2)
  .run(cmd)
  .end();
```

### #after

Register an "after" middleware.

```js
new Joker()
  .run(cmd)
  .after(fn)
  .after(fn2)
  .end();
```

### #cwd

Change the current working directory of the main command (specified with `run`).
Please note that this won't affect any other commands like `unlink` etc.

```js
new Joker()
  .cwd(__dirname)
  .run('pwd')
  .stdout(/test$/)
  .end();
```

### #base

Set a base command. Useful for templates.

```js
new Joker()
  .base('node ')
  .run('--version')
  .stdout('0.10.16')
  .end();
```

### #run

Set a primary command to execute:

```js
new Joker()
  .run('node --version')
  .stdout('0.10.16')
  .end(fn);
```

You could also run the test right after specifying the command to run:

```js
new Joker()
  .stdout('0.10.16')
  .run('node --version', fn);
```

### #stdin

Set the contents of stdin.

```js
new Joker()
  .stdin('foobar')
  .run('rev')
  .stdout('raboof')
  .end(fn);
```

### #env

Set environment variables.

```js
new Joker()
  .env('foo', 'bar')
  .env('baz', 'boo')
  .run('node --version')
  .stdout('0.10.16')
  .end(fn);
```

### #timeout

Set a timeout for the main command that you are about to test.

```js
new Joker()
  .timeout(1) // ms
  .run('cat /dev/null')
  .end(fn);
```

### #stdout

Set expectations on stdout.

```js
new Joker()
  .stdout('LICENSE Makefile')
  .run('ls')
  .end(fn);
```

Works with regular expressions too.

```js
new Joker()
  .stdout(/system/)
  .run('time')
  .end(fn);
```

### #stderr

Same as `stdout` but well.. surprise works with stderr.

```js
new Joker()
  .run('todo add')
  .stderr('Please speicfy a todo')
  .end(fn);
```

### #code

Expect a given exit code.

```js
new Joker()
  .run('todo add')
  .code(1)
  .end(fn);
```

### #exist

Check if a given path exists (works with both files and directories).

```js
new Joker()
  .run('mkdir /tmp/test')
  .exist('/tmp/test')
  .end(fn);
```

### #match

Check the contents of a file.

```js
new Joker()
  .writeFile(file, 'Hello')
  .run('node void.js')
  .match(file, 'Hello')
  .unlink(file)
  .end(done);
```

```js
new Joker()
  .writeFile(file, 'Hello')
  .run('node void.js')
  .match(file, /ello/)
  .unlink(file)
  .end(done);
```

### #mkdir

Create a new directory.

```js
new Joker()
  .mkdir('xml-database')
  .run('this does stuff with the xml-database directory')
  .end(fn);
```

### #exec

Execute a given command.

```js
new Joker()
  .writeFile('LICENSE', 'MIT License')
  .exec('git add -a')
  .exec('git commit -m "Add LICENSE"')
  .run('git log')
  .stdout(/LICENSE/)
  .end();
```

By default the commands will inherit the "world" for the main command which
includes environment variables, cwd, timeout. However, you can override this by
supplying a different "world":

```js
new Joker()
  .exec('git add LICENSE', { timeout: 4, cwd: '/tmp' })
  .run('git log')
  .stdout(/LICENSE/)
  .end();
```

### #writeFile

Create a file with or without given contents.

Without:

```js
new Joker()
  .writeFile(pathToFile)
  .end();
```

With:

```js
new Joker()
  .writeFile(pathToFile, data)
  .end();
```

### #rmdir

Remove a directory.

```js
new Joker()
  .mkdir('xml-database')
  .run('this does stuff with the xml-database directory')
  .rmdir('xml-database')
  .end(fn);
```

### #unlink

Unlink a file.

```js
new Joker()
  .writeFile('my-file', data)
  .run('this does stuff with my file')
  .unlink('my-file')
  .end(fn);
```

### #on

Detect a prompt for user input. Accepts a String or RegExp that appears in
the the stdout stream. Must be paired with #respond.

```js
new Joker()
  .run(cmd)
  .on('Your name: ')
  .respond('Joe User\n')
  .end();
```

### #respond

Write a response to the stdin stream when a prompt is detected.

See #on

### #end

Run the given test.

```js
new Joker()
  .run('ls')
  .stdout('this-is-not-porn-i-promise')
  .end(function(err) {});
```

The same might be accomplished with supplying a function to `run`:

```js
new Joker()
  .stdout('this-is-not-porn-i-promise')
  .run('ls', function(err) {});
```

### #clone

Deep clone a joker instance.

```js
const clone = new Joker()
  .before(fn)
  .after(fn)
  .run('my awesome command')
  .end()
  .clone();
```

### #expect

Register a custom expectation.

```js
new Joker()
  .expect(function(result) {
    if (result.stdout !== 'Unicorns') {
      return new Error('OMG');
    }
  })
  .run('ls')
  .end(fn);
```

## Installation

```bash
$ npm install @amilajack/joker
```

## Credits

Special thanks to:

- [Alexander Petkov](https://dribbble.com/apetkov) - logo design
- [Martin Lazarov](https://github.com/mlazarov) - various ideas
- [Radoslav Stankov](https://github.com/rstankov)

## Support the author

Do you like this project? Star the repository, spread the word - it really helps. You may want to follow
me on [Twitter](https://twitter.com/amilajack) and
[GitHub](https://github.com/amilajack). Thanks!
