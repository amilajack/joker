const { jokerFixture } = require('.');

describe('joker#base', () => {
  it('sets a base command', done => {
    jokerFixture()
      .base('node ')
      .run('code-0.js')
      .code(0)
      .end(done);
  });
});
