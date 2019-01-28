const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'tmp', 'writefile-test');

fs.writeFileSync(file, '');
