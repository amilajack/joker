const fs = require('fs');
const { join } = require('path');
const { jokerFixture } = require('.');

const file = join(__dirname, 'tmp', 'writefile-test');

describe('joker#exec', () => {
  it('runs the supplied command', done => {
    jokerFixture()
      .exec(`node ${join(__dirname, 'fixtures', 'create-file.js')}`)
      .run('node writefile.js')
      .stdout('File exists')
      .unlink(file)
      .end(done);
  });

  it('respects the current working directory', done => {
    const root = join(__dirname, 'tmp');
    const fixture = join(root, 'foo.tmp.js');

    jokerFixture()
      .cwd(root)
      .exec('touch foo.tmp.js')
      .run('')
      .end(err => {
        should.not.exist(err);
        fs.existsSync(fixture).should.be.true;
        fs.unlinkSync(fixture);
        done();
      });
  });
});
