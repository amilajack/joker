const fs = require('fs');
const join = require('path').join;

const file = join(__dirname, 'tmp', 'writefile-test');

describe('joker#writeFile', () => {
  it('creates a new file', done => {
    jokerFixture()
      .writeFile(file)
      .run('node writefile.js')
      .stdout('File exists')
      .after(() => {
        fs.unlinkSync(file);
      })
      .end(done);
  });
});
