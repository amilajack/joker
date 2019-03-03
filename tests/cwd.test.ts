import path from 'path';
import fs from 'fs';
import os from 'os';
import { Joker } from '.';

function mkdirTmpDir() {
  const tmpDir = path.join(
    os.tmpdir(),
    String(Math.floor(Math.random() * 100))
  );
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir);
  }
  return tmpDir;
}

describe('Joker#cwd', () => {
  it('should accept given path', async () => {
    const tmpDir = mkdirTmpDir();
    await new Joker({ showDiffs: false })
      .cwd(tmpDir)
      .run('echo foo')
      .end();
  });

  it('should change allow changing cwd to created dir', async () => {
    const tmpDir = path.join(
      os.tmpdir(),
      String(Math.floor(Math.random() * 100))
    );
    if (fs.existsSync(tmpDir)) {
      fs.rmdirSync(tmpDir);
    }
    await new Joker({ showDiffs: false })
      .mkdir(tmpDir)
      .cwd(tmpDir)
      .run('echo foo')
      .rmdir(tmpDir)
      .end();
    expect(fs.existsSync(tmpDir)).toBe(false);
  });

  it('should fail if given path does not exist', async () => {
    await expect(
      new Joker({ showDiffs: false })
        .cwd('non_existent_path')
        .run('echo foo')
        .end()
    ).rejects.toThrow('The path "non_existent_path" does not exist');
  });
});
