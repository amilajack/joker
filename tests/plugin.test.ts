import { Joker } from '.';
const should = require('chai').should();

describe('joker.register', () => {
  it('can register a single function', () => {
    const fn = function() {};
    new Joker().register('foo', fn);
    new Joker().should.respondTo('foo');
  });

  it('can register multiple functions at once', () => {
    const fn = function() {};
    const fn1 = function() {};

    new Joker().register({ baz: fn, bar: fn1 });

    new Joker().should.respondTo('baz');
    new Joker().should.respondTo('bar');
  });
});
