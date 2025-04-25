// Updated jest.config.js
module.exports = {
  verbose: true,
  rootDir: './',
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/test/**/*.test.js'],
  
  testPathIgnorePatterns: ['/node_modules/'],
  
  // Updated coverage configuration
  collectCoverage: true,
  collectCoverageFrom: [
    'src/public/js/**/*.js',
    'src/public/roles/**/*.js',
    'src/**/*.js',
    '!**/node_modules/**',
    '!**/test/**',
    '!**/coverage/**'
  ],
  coverageDirectory: 'coverage',
  
  globals: {
    fetch: true
  },

  reporters: [
    "default",
    "./test/custom-reporter.js"
  ],

  setupFilesAfterEnv: ['./test/setup.js'],
};