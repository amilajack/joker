import path from 'path';
import { jokerFixture } from '.';

const file = path.join(__dirname, 'tmp', 'exists-file-test');
const dir = path.join(__dirname, 'tmp', 'exists-dir-test');

describe('joker#exist', () => {
  it('can verify that a file exists', done => {
    jokerFixture()
      .writeFile(file)
      .run('node void.js')
      .exist(file)
      .unlink(file)
      .end(done);
  });

  it('returns an error when the file does not exist', done => {
    jokerFixture()
      .run('node void.js')
      .exist(file)
      .end(err => {
        expect(err !== null).toEqual(true);
        done();
      });
  });

  it('can verify that a directory exists', done => {
    jokerFixture()
      .mkdir(dir)
      .run('node void.js')
      .exist(dir)
      .rmdir(dir)
      .end(done);
  });

  it('returns an error when the directory does not exist', done => {
    jokerFixture()
      .run('node void.js')
      .exist(dir)
      .end(err => {
        expect(err !== null).toEqual(true);
        done();
      });
  });
});
