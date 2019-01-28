const joker = require('..');

describe('joker#run', () => {
  it('throws an error when no command is supplied', () => {
    should.throw(() => {
      joker().end(() => {});
    }, 'Please provide a command to run. Hint: `joker#run`');
  });
});
