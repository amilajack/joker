import {Joker} from '.';
const join = require('path').join;

describe('joker', () => {
  it('can strip \\n from stdout and stderr', done => {
    new Joker({ newLines: false })
      .cwd(join(__dirname, 'fixtures'))
      .run('node newlines.js')
      .stdout('Hello from newlines.js')
      .stderr('Error from newlines.js')
      .end(done);
  });

  it('can leave \\n in stdout and stderr', done => {
    new Joker({ newLines: true })
      .cwd(join(__dirname, 'fixtures'))
      .run('node newlines.js')
      .stdout('Hello \nfrom \nnewlines.js')
      .stderr('Error \nfrom \nnewlines.js')
      .end(done);
  });

  it('can strip \\r\\n from stdout and stderr', done => {
    new Joker({ newLines: false })
      .cwd(join(__dirname, 'fixtures'))
      .run('node newlines-crlf.js')
      .stdout('Hello from newlines-crlf.js')
      .stderr('Error from newlines-crlf.js')
      .end(done);
  });

  it('can leave \\r\\n in stdout and stderr', done => {
    new Joker({ newLines: true })
      .cwd(join(__dirname, 'fixtures'))
      .run('node newlines-crlf.js')
      .stdout('Hello \r\nfrom \r\nnewlines-crlf.js')
      .stderr('Error \r\nfrom \r\nnewlines-crlf.js')
      .end(done);
  });
});
