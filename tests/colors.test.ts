import path from 'path';
import { Joker } from '.';

describe('joker', () => {
  it('can strip colors from stdout and stderr', done => {
    new Joker({ colors: false, showDiffs: false })
      .cwd(path.join(__dirname, 'fixtures'))
      .run('node colors.js')
      .stdout('Stdout')
      .stderr('Stderr')
      .end(done);
  });
});
