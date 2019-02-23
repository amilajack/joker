import { jokerFixture } from '.';
import { BatchFunctionArg } from '../src/batch';

describe('async joker', () => {
  it('force quits comamnds that take longer than specified', async () => {
    const err = await jokerFixture()
      .run('node timeout.js')
      .timeout(100)
      .end();

    expect(err as BatchFunctionArg).toHaveProperty(
      'message',
      '`node timeout.js`: Command execution terminated (timeout)'
    );
  });
});
