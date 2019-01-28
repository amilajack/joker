/**
 * Primary exports.
 */

module.exports = require('./joker/runner');
module.exports.register = require('./joker/plugin');
module.exports.version = require('../package.json').version;
