module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/test'],
    transform: {
      '^.+\\.jsx?$': 'babel-jest',
    },
    moduleFileExtensions: ['js', 'json', 'node'],
    testTimeout: 10000,
  };
  