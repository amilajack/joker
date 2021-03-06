import path from 'path';
import { jokerFixture } from '.';

const file = path.join(__dirname, 'tmp', 'writefile-test');

describe('joker#match', () => {
  it('can assert with strings', done => {
    jokerFixture()
      .writeFile(file, 'Hello')
      .run('node void.js')
      .match(file, 'Hello')
      .unlink(file)
      .end(done);
  });

  it('can assert with regular expressions', done => {
    jokerFixture()
      .writeFile(file, 'Hello')
      .run('node void.js')
      .match(file, /ello/)
      .unlink(file)
      .end(done);
  });

  it('returns an error when the contents does not match the desired string', done => {
    jokerFixture()
      .writeFile(file, 'Hello')
      .run('node void.js')
      .match(file, 'Bye')
      .unlink(file)
      .end(err => {
        expect(err).not.toEqual(true);
        done();
      });
  });
});
