const fs = require('fs');
const join = require('path').join;

const dir = join(__dirname, 'tmp', 'mkdir-test');

describe('joker#mkdir', () => {
  it('creates a new directory', done => {
    jokerFixture()
      .mkdir(dir)
      .run('node mkdir.js')
      .stdout('Directory exists')
      .after(() => {
        fs.rmdirSync(dir);
      })
      .end(done);
  });
});
