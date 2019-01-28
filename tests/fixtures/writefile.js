const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'tmp', 'writefile-test');

if (fs.existsSync(file)) {
  console.log('File exists');
}
