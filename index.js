const fs = require('fs');
const path = require('path');

const exchanges = {};

fs.readdirSync(path.resolve(__dirname, './exchanges/')).forEach(file => {
  exchanges[file.split('.')[0]] = require(path.resolve(__dirname, './exchanges/'+file));
});

module.exports = exchanges;