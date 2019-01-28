import fs from 'fs';
import path from 'path';
import { jokerFixture } from '.';

const file1 = path.join(__dirname, 'tmp', 'file-1');
const file2 = path.join(__dirname, 'tmp', 'file-2');

describe('joker filters', () => {
  it('runs the filters in the expected order', done => {
    let before = 0;
    let after = 0;

    jokerFixture()
      .before(() => {
        before++;
        fs.writeFileSync(file1, '');
      })
      .before(next => {
        before++;
        expect(fs.existsSync(file1)).toEqual(true);
        fs.writeFile(file2, '', next);
      })
      .after(() => {
        after++;
        fs.unlinkSync(file1);
        fs.unlinkSync(file2);
      })
      .run('node filters.js')
      .stdout('Files exist')
      .end(() => {
        expect(before).toEqual(2);
        expect(after).toEqual(1);

        expect(fs.existsSync(file1)).toEqual(false);
        expect(fs.existsSync(file2)).toEqual(false);

        done();
      });
  });
});
