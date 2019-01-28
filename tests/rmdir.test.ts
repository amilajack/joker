import { jokerFixture } from '.';
const fs = require('fs');
const join = require('path').join;
var rimraf = require("rimraf");

const dir = join(__dirname, 'tmp', 'mkdir-test');


describe.only('joker#rmdir', () => {
  beforeAll(() => {
    rimraf.sync(dir);
  });

  it('removes a directory', done => {
    jokerFixture()
      .mkdir(dir)
      .run('node mkdir.js')
      // .stdout('Directory exists')
      .rmdir(dir)
      .after(() => {
        expect(fs.existsSync(dir)).toEqual(false);
      })
      .end(done);
  });
});
