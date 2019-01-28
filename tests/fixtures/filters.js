const fs = require('fs');
const path = require('path');

const file1 = path.join(__dirname, '..', 'tmp', 'file-1');
const file2 = path.join(__dirname, '..', 'tmp', 'file-2');

if (fs.existsSync(file1) && fs.existsSync(file2)) {
  console.log('Files exist');
} else {
  console.log('Files do not exist');
}
