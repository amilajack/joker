const { jokerFixture } = require('.');

describe('joker#env', () => {
  it('sets environemt variables', done => {
    jokerFixture()
      .env('HELLO', 'true')
      .env('BYE', 'true')
      .run('node env.js')
      .code(0)
      .end(done);
  });
});
