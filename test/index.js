const path = require('path');
const joker = require('../src');

function jokerFixture() {
  return joker().cwd(path.join(__dirname, 'test', 'fixtures'));
}
module.exports = { jokerFixture };
