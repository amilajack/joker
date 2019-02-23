import { Joker } from '.';

describe('joker#run', () => {
  it('throws an error when no command is supplied', () => {
    expect(() => new Joker().end(() => {})).toThrow(
      'Please provide a command to run. Hint: You may have forgotten to call `joker.run(myFunction)`'
    );
  });
});
