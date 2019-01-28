import {Joker} from '.';

describe('joker#run', () => {
  it('throws an error when no command is supplied', () => {
    should.throw(() => {
      new Joker().end(() => {});
    }, 'Please provide a command to run. Hint: `joker#run`');
  });
});
