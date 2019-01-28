import { jokerFixture } from '.';
const fs = require('fs');
const { join } = require('path');

const file = join(__dirname, 'tmp', 'exists-file-test');
const dir = join(__dirname, 'tmp', 'exists-dir-test');

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
        (err !== null).should.eq(true);
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
        (err !== null).should.eq(true);
        done();
      });
  });
});
