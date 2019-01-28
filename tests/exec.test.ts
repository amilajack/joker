import fs from 'fs';
import path from 'path';
import { jokerFixture } from '.';

const root = path.join(__dirname, 'tmp');

describe('joker#exec', () => {
  it('runs the supplied command', done => {
    const file = path.join(root, 'writefile-test');
    jokerFixture()
      .exec(`node ${path.join(__dirname, 'fixtures', 'create-file.js')}`)
      .run('node writefile.js')
      .stdout('File exists')
      .unlink(file)
      .end(done);
  });

  it('respects the current working directory', done => {
    const fixture = path.join(root, 'foo.tmp.js');
    jokerFixture()
      .cwd(root)
      .exec('touch foo.tmp.js')
      .run('')
      .end(err => {
        expect(fs.existsSync(fixture)).toBe(true);
        fs.unlinkSync(fixture);
        done();
      });
  });
});
