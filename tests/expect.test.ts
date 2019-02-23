import { jokerFixture } from '.';

describe('joker#expect', () => {
  it('should run expect after main function', async () => {
    await jokerFixture()
      .run('echo foo')
      .expect(res => {
        expect(res.code).toEqual(0);
        expect(res.killed).toEqual(false);
        expect(res.stderr).toEqual('');
        expect(res.stdout).toEqual('foo');
      })
      .end();
  });
});
