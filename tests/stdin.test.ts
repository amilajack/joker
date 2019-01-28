describe('joker#stdin', () => {
  it('no effect if stdin is not used', done => {
    jokerFixture()
      .run('node hello.js')
      .stdout('Hello')
      .end(done);
  });

  it('passes given string on stdin', done => {
    jokerFixture()
      .stdin('foo\nbar')
      .run('node rev.js')
      .stdout('oof\nrab')
      .end(done);
  });

  it('does end the input stream', done => {
    jokerFixture()
      .stdin('')
      .run('node rev.js')
      .stdout('')
      .end(done);
  });
});
