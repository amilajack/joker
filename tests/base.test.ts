import { jokerFixture } from '.';

describe('joker#base', () => {
  it('sets a base command', done => {
    jokerFixture()
      .base('node')
      .run('code-0.js')
      .code(0)
      .run('--version')
      .code(0)
      .run(`-e "console.log('hello world')"`)
      .stdout('hello world')
      .code(0)
      .end(done);
  });
});
