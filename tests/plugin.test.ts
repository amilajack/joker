const joker = require('..');
const should = require('chai').should();

describe('joker.register', () => {
  it('can register a single function', () => {
    const fn = function() {};
    joker.register('foo', fn);
    joker.should.respondTo('foo');
  });

  it('can register multiple functions at once', () => {
    const fn = function() {};
    const fn1 = function() {};

    joker.register({ baz: fn, bar: fn1 });

    joker.should.respondTo('baz');
    joker.should.respondTo('bar');
  });
});
