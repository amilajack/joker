const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'tmp', 'mkdir-test');

if (fs.existsSync(dir)) {
  console.log('Directory exists');
} else {
  console.log(`${dir} does not exist`);
}
