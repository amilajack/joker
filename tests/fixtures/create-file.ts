const fs = require('fs');
const join = require('path').join;

const file = join(__dirname, '..', 'tmp', 'writefile-test');

fs.writeFileSync(file, '');
