import { Joker } from '.';

const { join } = require('path');

describe('joker', () => {
  it('can strip colors from stdout and stderr', done => {
    new Joker({ colors: false })
      .cwd(join(__dirname, 'fixtures'))
      .run('node colors.js')
      .stdout('Stdout')
      .stderr('Stderr')
      .end(done);
  });
});
