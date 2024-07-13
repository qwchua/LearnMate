module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test/infra'],
  testMatch: ['**/*.test.ts'],
  verbose: true,
  forceExit: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
