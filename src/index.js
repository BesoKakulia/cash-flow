const fs = require('fs');

function getCommission(inputFile) {
  const input = fs.readFileSync(inputFile);
  // catch errors
  const parsedInput = JSON.parse(input);
  return parsedInput;
}

module.exports = { getCommission };
