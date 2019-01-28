import fs from 'fs';
import path from 'path';
import { jokerFixture } from '.';

const file = path.join(__dirname, 'tmp', 'writefile-test');

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
