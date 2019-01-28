[![NPM version](https://badge.fury.io/js/joker.svg)](http://badge.fury.io/js/joker)
[![Build Status](https://secure.travis-ci.org/amilajack/joker.svg)](http://travis-ci.org/amilajack/joker)

![joker](http://i.imgur.com/aBudpSE.jpg)

## Synopsis

Simple and powerful end-to-end testing for command-line apps.

## Description

joker is aiming to make testing of command-line apps as simple as possible. It
plays nice with the testing tools that you are already using and in case you are
one of those devs who practice outside-in BDD, it has the potential to become
something that lives in every command-line app that you are going to build.

### How it looks

```js
import joker from 'joker';

joker()
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

joker(options).stdout...
```

### Custom expectations

While joker comes with built-in expectations, you can use your own too.

```js
joker()
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
joker()
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
joker()
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
const base = joker()
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
joker.register('foo', fn);
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
    joker()
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

joker()
  .run(cmd)
  .end(refute);

joker()
  .run(anotherCmd)
  .end(refute);
```

### Responding to interactive prompts

joker can respond to apps that run interactively using the `on()` and
`respond()` functions.

```js
joker()
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
joker()
  .before(fn)
  .before(fn2)
  .run(cmd)
  .end();
```

### #after

Register an "after" middleware.

```js
joker()
  .run(cmd)
  .after(fn)
  .after(fn2)
  .end();
```

### #cwd

Change the current working directory of the main command (specified with `run`).
Please note that this won't affect any other commands like `unlink` etc.

```js
joker()
  .cwd(__dirname)
  .run('pwd')
  .stdout(/test$/)
  .end();
```

### #base

Set a base command. Useful for templates.

```js
joker()
  .base('node ')
  .run('--version')
  .stdout('0.10.16')
  .end();
```

### #run

Set a primary command to execute:

```js
joker()
  .run('node --version')
  .stdout('0.10.16')
  .end(fn);
```

You could also run the test right after specifying the command to run:

```js
joker()
  .stdout('0.10.16')
  .run('node --version', fn);
```

### #stdin

Set the contents of stdin.

```js
joker()
  .stdin('foobar')
  .run('rev')
  .stdout('raboof')
  .end(fn);
```

### #env

Set environment variables.

```js
joker()
  .env('foo', 'bar')
  .env('baz', 'boo')
  .run('node --version')
  .stdout('0.10.16')
  .end(fn);
```

### #timeout

Set a timeout for the main command that you are about to test.

```js
joker()
  .timeout(1) // ms
  .run('cat /dev/null')
  .end(fn);
```

### #stdout

Set expectations on stdout.

```js
joker()
  .stdout('LICENSE Makefile')
  .run('ls')
  .end(fn);
```

Works with regular expressions too.

```js
joker()
  .stdout(/system/)
  .run('time')
  .end(fn);
```

### #stderr

Same as `stdout` but well.. surprise works with stderr.

```js
joker()
  .run('todo add')
  .stderr('Please speicfy a todo')
  .end(fn);
```

### #code

Expect a given exit code.

```js
joker()
  .run('todo add')
  .code(1)
  .end(fn);
```

### #exist

Check if a given path exists (works with both files and directories).

```js
joker()
  .run('mkdir /tmp/test')
  .exist('/tmp/test')
  .end(fn);
```

### #match

Check the contents of a file.

```js
joker()
  .writeFile(file, 'Hello')
  .run('node void.js')
  .match(file, 'Hello')
  .unlink(file)
  .end(done);
```

```js
joker()
  .writeFile(file, 'Hello')
  .run('node void.js')
  .match(file, /ello/)
  .unlink(file)
  .end(done);
```

### #mkdir

Create a new directory.

```js
joker()
  .mkdir('xml-database')
  .run('this does stuff with the xml-database directory')
  .end(fn);
```

### #exec

Execute a given command.

```js
joker()
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
joker()
  .exec('git add LICENSE', { timeout: 4, cwd: '/tmp' })
  .run('git log')
  .stdout(/LICENSE/)
  .end();
```

### #writeFile

Create a file with or without given contents.

Without:

```js
joker()
  .writeFile(pathToFile)
  .end();
```

With:

```js
joker()
  .writeFile(pathToFile, data)
  .end();
```

### #rmdir

Remove a directory.

```js
joker()
  .mkdir('xml-database')
  .run('this does stuff with the xml-database directory')
  .rmdir('xml-database')
  .end(fn);
```

### #unlink

Unlink a file.

```js
joker()
  .writeFile('my-file', data)
  .run('this does stuff with my file')
  .unlink('my-file')
  .end(fn);
```

### #on

Detect a prompt for user input. Accepts a String or RegExp that appears in
the the stdout stream. Must be paired with #respond.

```js
joker()
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
joker()
  .run('ls')
  .stdout('this-is-not-porn-i-promise')
  .end(function(err) {});
```

The same might be accomplished with supplying a function to `run`:

```js
joker()
  .stdout('this-is-not-porn-i-promise')
  .run('ls', function(err) {});
```

### #clone

Deep clone a joker instance.

```js
const clone = joker()
  .before(fn)
  .after(fn)
  .run('my awesome command')
  .end()
  .clone();
```

### #expect

Register a custom expectation.

```js
joker()
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
$ npm install joker
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
