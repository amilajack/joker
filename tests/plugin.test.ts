import { Joker } from '.';

describe('joker.register', () => {
  it('can register a single function', () => {
    const fn = function() {};
    new Joker().register('foo', fn);
    expect(new Joker()).toHaveProperty('foo');
  });

  it('can register multiple functions at once', () => {
    const fn = function() {};
    const fn1 = function() {};

    new Joker().register({ baz: fn, bar: fn1 });

    expect(new Joker()).toHaveProperty('baz');
    expect(new Joker()).toHaveProperty('bar');
  });
});
