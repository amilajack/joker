import { Joker } from '.';

describe('Joker options', () => {
  it('should accept given path', async () => {
    await expect(
      new Joker({ showDiffs: true })
        .run('node --version')
        .stdout('foo')
        .end()
    ).rejects.toThrow();
  });

  it('should default to showDiffs = true', async () => {
    await expect(
      new Joker()
        .run('node --version')
        .stdout('foo')
        .end()
    ).rejects.toThrow();
  });
});
