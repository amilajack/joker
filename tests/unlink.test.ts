const fs = require('fs');
const join = require('path').join;
import { jokerFixture } from '.';

const file = join(__dirname, 'tmp', 'writefile-test');

describe('joker#unlink', () => {
  it('removes a file', done => {
    jokerFixture()
      .writeFile(file)
      .run('node writefile.js')
      .stdout('File exists')
      .unlink(file)
      .after(() => {
        expect(fs.existsSync(file)).toEqual(false)
      })
      .end(done);
  });
});
