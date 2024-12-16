module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }]
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '/__tests__/.*\\.test\\.(ts|tsx)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/src/test/'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/test/**',
    '!src/**/*.d.ts',
  ],
  setupFiles: ['<rootDir>/src/test/setup.ts']
};