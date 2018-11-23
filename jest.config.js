module.exports = {
  automock: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
  ],
  roots: [
    '<rootDir>/src',
    '<rootDir>/test',
  ],
  setupFiles: [
    './test/setup.js',
  ],
  testMatch: [
    '<rootDir>/test/**/?(*.)(spec|test).js?(x)',
  ],
};
