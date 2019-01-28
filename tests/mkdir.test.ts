import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { jokerFixture } from '.';

const dir = path.join(__dirname, 'tmp', 'mkdir-test');

describe('joker#mkdir', () => {
  beforeAll(() => {
    rimraf.sync(dir);
  });

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
