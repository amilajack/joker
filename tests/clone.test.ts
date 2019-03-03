import { Joker } from '.';

describe('Joker#clone', () => {
  it('should accept given path', async () => {
    const foo = new Joker({ showDiffs: false }).base('node');

    await foo
      .clone()
      .run('--version')
      .expect(res => {
        expect(res.stdout).toContain('.');
      })
      .end();

    await foo
      .clone()
      .run(`-e "console.log('foo')"`)
      .expect(res => {
        expect(res.stdout).toEqual('foo');
      })
      .end();
  });
});
