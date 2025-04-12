// jest.config.js
module.exports = {
  // The root directory that Jest should scan for tests and modules
  rootDir: './',
  
  // The test environment that will be used for testing
  testEnvironment: 'jsdom',
  
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/test/**/*.test.js'],
  
  // An array of regexp pattern strings that are matched against all test paths
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Coverage reporting options
  collectCoverage: true,
  collectCoverageFrom: ['src/public/js/*.js'],
  coverageDirectory: 'coverage',
  
  // A set of global variables that need to be available in all test environments
  globals: {
    fetch: true
  },
  
  // Setup files before tests are run
  setupFilesAfterEnv: ['./test/setup.js'],
};