import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { jokerFixture } from '.';

const dir = path.join(__dirname, 'tmp', 'mkdir-test');

describe('joker#rmdir', () => {
  beforeAll(() => {
    rimraf.sync(dir);
  });

  it('removes a directory', done => {
    jokerFixture()
      .mkdir(dir)
      .run('node mkdir.js')
      .stdout('Directory exists')
      .rmdir(dir)
      .after(() => {
        expect(fs.existsSync(dir)).toEqual(false);
      })
      .end(done);
  });
});
