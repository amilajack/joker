import { jokerFixture } from '.';

describe('joker#timeout', () => {
  it('force quits comamnds that take longer than specified', done => {
    jokerFixture()
      .run('node timeout.js')
      .timeout(100)
      .end(err => {
        expect(err.message).toEqual(
          '`node timeout.js`: Command execution terminated (timeout)'
        );
        done();
      });
  });
});
