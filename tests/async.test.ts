import { jokerFixture } from '.';

describe('async joker', () => {
  it('should reject if main function is forcefully aborted', async () => {
    await expect(
      jokerFixture()
        .run('node timeout.js')
        .timeout(100)
        .end()
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('should reject if assertion fails', async () => {
    await expect(
      jokerFixture()
        .run('echo foo')
        .stdout('baz')
        .end()
    ).rejects.toThrow();
  });

  it('should reject if assertion fails', async () => {
    await expect(
      jokerFixture()
        .run(`node -e "require('foo')"`)
        .stderr('baz')
        .end()
    ).rejects.toThrow();
  });

  it('should fail when stderr does not match stderr assertion', async () => {
    await expect(
      jokerFixture()
        .run(`node -e "require('foo')"`)
        .code(1)
        .stderr('foo')
        .end()
    ).rejects.toBeTruthy();
  });
});
