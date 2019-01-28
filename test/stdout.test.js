describe('joker#stdout', () => {
  it('can assert with strings', done => {
    jokerFixture()
      .run('node hello.js')
      .stdout('Hello')
      .end(done);
  });

  it('returns an error when stdout does not match the desired string', done => {
    jokerFixture()
      .run('node hello.js')
      .stdout('Fail')
      .end(err => {
        err.message.should.eq(
          '`node hello.js`: Expected stdout to match "Fail". Actual: "Hello"'
        );
        done();
      });
  });

  it('can assert with regular expressions', done => {
    jokerFixture()
      .run('node hello.js')
      .stdout(/Hell/)
      .end(done);
  });

  it('returns an error when the regexp does not match the stdout', done => {
    jokerFixture()
      .run('node hello.js')
      .stdout(/Fail/)
      .end(err => {
        err.message.should.eq(
          '`node hello.js`: Expected stdout to match "/Fail/". Actual: "Hello"'
        );
        done();
      });
  });
});
