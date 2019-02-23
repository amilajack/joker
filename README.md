> ## 🛠 Status: In Development
> Joker is currently in development. It's on the fast track to a 1.0 release, so we encourage you to use it and give us your feedback, but there are things that haven't been finalized yet and you can expect some changes.

[![Build Status](https://dev.azure.com/amilajack/amilajack/_apis/build/status/amilajack.joker?branchName=master)](https://dev.azure.com/amilajack/amilajack/_build/latest?definitionId=1&branchName=master)

An modern and intuitive testing for command-line apps.

## Installation

```bash
$ npm install --save @amilajack/joker
```

## How it looks

```js
import Joker from '@amilajack/joker';

new Joker()
  .exec('touch /tmp/test')
  .run('ls /tmp/')
  .stdout(/test/)
  .end();
```

## API

See [full API docs](https://amilajack.github.io/joker/classes/runner)

## Features

### Formatting options

Joker can strip newlines and colors. You can tell it to do so by passing an
object that looks like this:

```js
const options = {
  colors: true,
  newLines: true,
};

new Joker(options)
```

### Custom expectations

While Joker comes with built-in expectations, you can use your own too.

```js
new Joker()
  .expect((result) => {
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
can accomplish this by cloning a Joker instance.

```js
const base = new Joker()
  .before(setupDatabase)
  .after(removeDatabase);

// Later on

base.clone().run....
```

### Plugins

Joker has primitive support for plugins. You can register any expectation or/and
any middleware by calling `joker.register`.

```js
const fn = () => {};
new Joker().register('foo', fn);
```

Or you may want to register many functions at once.

```js
const fn = () => {};
const fn1 = () => {};
joker.register({ baz: fn, bar: fn1 });
```

### Usage with a test runner

Joker plays nice with any test runner out there. Here is a minimal example how
you could use it with Mocha.

```js
describe('todo add', () => {
  it('adds a new todo item', (done) => {
    new Joker()
      .run('todo add')
      .stdout('A new todo has been added')
      .end(done);
  });
});
```

### Usage without a test runner

While using a test runner is recommended Joker is completely 'nodeable'. Here is
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

Joker can respond to apps that run interactively using the `on()` and
`respond()` functions.

```js
new Joker()
  .run(cmd)
  .on('Your name: ')
  .respond('Joe User\n')
  .end();
```

See [`test/prompt.test.ts`](https://github.com/amilajack/joker/blob/master/tests/prompt.test.ts) for more examples.

## Credits

Special thanks to:

- [Martin Lazarov](https://github.com/mlazarov)
- [Radoslav Stankov](https://github.com/rstankov)

## Support the author

Do you like this project? Star the repository, spread the word - it really helps. You may want to follow
me on [Twitter](https://twitter.com/amilajack) and
[GitHub](https://github.com/amilajack). Thanks!
