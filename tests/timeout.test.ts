import { jokerFixture } from '.';

describe('joker#timeout', () => {
  it('force quits comamnds that take longer than specified', done => {
    jokerFixture()
      .run('node timeout.js')
      .timeout(100)
      .end(err => {
        err.message.should.eq(
          '`node timeout.js`: Command execution terminated (timeout)'
        );
        done();
      });
  });
});
