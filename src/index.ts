module.exports = process.env.joker_COV
  ? require('../lib-cov/joker')
  : require('./joker');
