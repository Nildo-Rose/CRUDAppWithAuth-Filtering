const fs = require('fs');
const path = require('path');

const apiUrl = process.env.NG_APP_API_URL || '/api';
const outPath = path.join(__dirname, '..', 'src', 'environments', 'environment.prod.ts');
const content = `export const environment = {
  production: true,
  apiUrl: '${apiUrl.replace(/'/g, "\\'")}',
};
`;
fs.writeFileSync(outPath, content, 'utf8');
console.log('Wrote environment.prod.ts with apiUrl:', apiUrl);
