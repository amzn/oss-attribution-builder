#!/usr/bin/env node

const fs = require('fs');

const out = {};

const files = fs.readdirSync('.');
for (const name of files) {
  if (name.endsWith('.json')) {
    const content = fs.readFileSync(name, 'utf8');
    const data = JSON.parse(content);
    out[data.licenseId] = {
      text: data.licenseText,
    }
  }
}

console.log(JSON.stringify(out));
