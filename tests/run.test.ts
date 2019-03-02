import { Joker } from '.';

describe('Joker#run', () => {
  it('should allow running multiple main functions', done => {
    new Joker()
      .run('echo foo')
      .expect(res => {
        expect(res.stdout).toEqual('foo');
      })
      .end(done);
  });

  it('should allow running multiple main functions', done => {
    new Joker()
      .run('echo foo')
      .stdout('foo')
      .run('echo bar')
      .stdout('bar')
      .end(done);
  });

  it('should set NODE_ENV to "test" by default', () => {
    const joker = new Joker().exec('echo foo');
    // @ts-ignore
    expect(joker.environment.env).toHaveProperty('NODE_ENV', 'test');
  });
});
