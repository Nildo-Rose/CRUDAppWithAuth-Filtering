module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFiles: ['<rootDir>/jest.setup.js'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['routes/**/*.js', 'app.js'],
  coveragePathIgnorePatterns: ['/node_modules/'],
};
