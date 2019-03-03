import { Joker } from '.';
import Plugin from '../src/plugin';

describe('joker.register', () => {
  it('can register a single function', async () => {
    const fn = () => {
      console.log('fn');
    };
    new Joker({ showDiffs: false }).register('fn', fn);
    expect(new Joker({ showDiffs: false })).toHaveProperty('fn');
    await new Joker({ showDiffs: false })
      // @ts-ignore
      .fn()
      .run('echo foo')
      .end();
  });

  it('can register multiple functions at once', async () => {
    const fn1 = () => {
      console.log('fn1');
    };
    const fn2 = () => {
      console.log('fn2');
    };

    new Joker({ showDiffs: false }).register({ fn1, fn2 });

    expect(new Joker({ showDiffs: false })).toHaveProperty('fn1');
    expect(new Joker({ showDiffs: false })).toHaveProperty('fn2');

    await new Joker({ showDiffs: false })
      // @ts-ignore
      .fn1()
      .fn2()
      .run('echo foo')
      .end();
  });

  it('should allow passing plugins to constructor', () => {
    Plugin('foo', () => {});
    Plugin('defaultFunction');
    Plugin({
      foo: () => {},
      bar: () => {},
      baz: () => {}
    });
  });

  it('should override previously registered functions', async () => {
    let fn1Called = false;
    let fn2Called = false;
    await new Joker({ showDiffs: false })
      .register('fn1', () => {
        fn1Called = true;
      })
      .register('fn1', () => {
        fn2Called = true;
      })
      // @ts-ignore
      .fn1()
      .run('echo foo')
      .end();
    expect(fn1Called).toEqual(false);
    expect(fn2Called).toEqual(true);
  });
});
