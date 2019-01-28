describe('joker#stderr', () => {
  it('can assert with strings', done => {
    jokerFixture()
      .run('node hello-err.js')
      .stderr('Hello')
      .end(done);
  });

  it('returns an error when stderr does not match the desired string', done => {
    jokerFixture()
      .run('node hello-err.js')
      .stderr('Fail')
      .end(err => {
        err.message.should.eq(
          '`node hello-err.js`: Expected stderr to match "Fail". Actual: "Hello"'
        );
        done();
      });
  });

  it('can assert with regular expressions', done => {
    jokerFixture()
      .run('node hello-err.js')
      .stderr(/Hell/)
      .end(done);
  });

  it('returns an error when the regexp does not match the stderr', done => {
    jokerFixture()
      .run('node hello-err.js')
      .stderr(/Fail/)
      .end(err => {
        err.message.should.eq(
          '`node hello-err.js`: Expected stderr to match "/Fail/". Actual: "Hello"'
        );
        done();
      });
  });
});
