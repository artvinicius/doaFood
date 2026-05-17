const fs = require('fs');
const path = require('path');

const DB_PATH = path.resolve(__dirname, '../../data/doafood.json');

function read() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { usuarios: [], pontos_coleta: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function write(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
