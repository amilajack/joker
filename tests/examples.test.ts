import { jokerFixture } from '.';

describe('examples', () => {
  it('should render', done => {
    jokerFixture()
      .exec('touch /tmp/test')
      .run('ls /tmp/')
      .stdout(/test/)
      .end(done);
  });
});
