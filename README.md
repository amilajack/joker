![logo](./logo.jpg)

[![Build Status](https://dev.azure.com/amilajack/amilajack/_apis/build/status/amilajack.joker?branchName=master)](https://dev.azure.com/amilajack/amilajack/_build/latest?definitionId=1&branchName=master)
[![NPM version](https://img.shields.io/npm/v/@amilajack/joker.svg)](https://www.npmjs.com/package/@amilajack/joker)
[![npm](https://img.shields.io/npm/dm/@amilajack/joker.svg)](https://npm-stat.com/charts.html?package=@amilajack/joker)
[![codecov](https://codecov.io/gh/amilajack/joker/branch/master/graph/badge.svg)](https://codecov.io/gh/amilajack/joker)

A modern and intuitive testing library for command-line apps

## Installation

```bash
npm install --save-dev @amilajack/joker
```

## How it looks

```js
const path = require('path');
const assert = require('assert');
const { default: Joker } = require('@amilajack/joker');

(async () => {
  await new Joker()
    .run('echo hello')
    .expect((result) => {
      assert(result.stdout === 'hello');
    })
    .code(0)
    .end();
})();
```

## API

See [full API docs](https://amilajack.github.io/joker/classes/runner)

## Features

### Formatting options

Joker can strip new line characters and colors. You can tell it to do so by passing an
object that looks like this:

```js
const options = {
  colors: false,
  newLines: false
};

new Joker(options);
```

### Custom expectations

While Joker comes with built-in expectations, you can use your own too.

```js
await new Joker()
  .run('unicorns')
  .expect(result => {
    if (result.stdout !== 'unicorns') {
      return new Error('NO!');
    }
  })
  .end();
```

### Custom middlewares

You can register as many before and after middlewares as you wish.

```js
await new Joker()
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
await new Joker()
  .before(before1)
  .before(before2)
  .after(after1)
  .after(after2)
  .writeFile(file, '')
  .run(cmd)
  .unlink(file)
  .end();

// Execution order:
// before1, before2, writeFile, cmd, unlink, after1, after2
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

Joker plays nice with any test runner out there.

#### Jest

Here is a minimal example how you could use it with [Jest](http://jestjs.io) using async/await:

```js
describe('todo add', () => {
  it('adds a new todo item', async () => {
    const result = await new Joker()
      .run('todo add')
      .stdout('A new todo has been added')
      .end();
    expect(result.stdout).toMatchSnapshot();
  });
});
```

#### Mocha

Here is a minimal example how you could use it with [Mocha](http://mochajs.org) using callbacks:

```js
describe('todo add', () => {
  it('adds a new todo item', done => {
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
await new Joker()
  .run(cmd)
  .on('Your name: ')
  .respond('Joe User\n')
  .end();
```

See [`test/prompt.test.ts`](https://github.com/amilajack/joker/blob/master/tests/prompt.test.ts) for more examples.

### Templates

Every `Joker` instance can be cloned, which allows you to build "templates" for tests. Here's some examples:

```js
const template = new Joker()
  .cwd(path.join(__dirname, 'fixtures'))
  .run('echo test');

const test1 = await template
  .clone()
  .stdout(/test/)
  .end();

const test2 = await template
  .clone()
  .stdout('test')
  .end();
```

## Credits

Special thanks to:

- [Martin Lazarov](https://github.com/mlazarov)
- [Radoslav Stankov](https://github.com/rstankov)

## Support

Do you like this project? Star the repository, spread the word - it really helps. You may want to follow
me on [Twitter](https://twitter.com/amilajack) and
[GitHub](https://github.com/amilajack). Thanks!

If this project is saving you (or your team) time, please consider supporting it on Patreon 👍 thank you!

<p>
  <a href="https://www.patreon.com/amilajack">
    <img src="https://c5.patreon.com/external/logo/become_a_patron_button@2x.png" width="160">
  </a>
</p>
