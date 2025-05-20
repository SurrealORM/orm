module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/test/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { 
      tsconfig: 'tsconfig.jest.json',
      useESM: true
    }]
  },
  setupFilesAfterEnv: ['./test/setup.ts'],
  testTimeout: 10000, // Increased timeout for database operations
  globalSetup: './test/globalSetup.ts',
  globalTeardown: './test/globalTeardown.ts',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}; 