const fs = require('fs');
const join = require('path').join;

const file = join(__dirname, 'tmp', 'writefile-test');

describe('joker#unlink', () => {
  it('removes a file', done => {
    jokerFixture()
      .writeFile(file)
      .run('node writefile.js')
      .stdout('File exists')
      .unlink(file)
      .after(() => {
        fs.existsSync(file).should.eq(false);
      })
      .end(done);
  });
});
