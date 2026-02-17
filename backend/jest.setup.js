const path = require('path');
const os = require('os');

process.env.NODE_ENV = 'test';
process.env.DB_DIR = path.join(os.tmpdir(), `crud-app-test-${Date.now()}`);
process.env.JWT_SECRET = 'test-secret';
