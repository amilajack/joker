import path from 'path';
import fs from 'fs';
import os from 'os';
import { Joker } from '.';

describe('Joker#cwd', () => {
  it('should accept given path', async () => {
    const tmpDir = path.join(
      os.tmpdir(),
      String(Math.floor(Math.random() * 100))
    );
    fs.mkdirSync(tmpDir);
    await new Joker()
      .cwd(tmpDir)
      .run('echo foo')
      .end();
  });

  it('should change allow changing cwd to created dir', async () => {
    const tmpDir = path.join(
      os.tmpdir(),
      String(Math.floor(Math.random() * 100))
    );
    expect(fs.existsSync(tmpDir)).toBe(false);
    await new Joker()
      .mkdir(tmpDir)
      .cwd(tmpDir)
      .run('echo foo')
      .rmdir(tmpDir)
      .end();
    expect(fs.existsSync(tmpDir)).toBe(false);
  });

  it('should fail if given path does not exist', async () => {
    await expect(
      new Joker()
        .cwd('non_existent_path')
        .run('echo foo')
        .end()
    ).rejects.toThrow('The path "non_existent_path" does not exist');
  });
});
