import { jokerFixture } from '.';
const fs = require('fs');
const join = require('path').join;

const dir = join(__dirname, 'tmp', 'mkdir-test');

describe('joker#rmdir', () => {
  it('removes a directory', done => {
    jokerFixture()
      .mkdir(dir)
      .run('node mkdir.js')
      .stdout('Directory exists')
      .rmdir(dir)
      .after(() => {
        fs.existsSync(dir).should.eq(false);
      })
      .end(done);
  });
});
