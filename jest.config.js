const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import('jest').Config} */
module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/config.ts',
    '!src/index.ts',
    '!src/utils/validators/**',
    '!src/utils/db.ts',
    '!src/utils/sha256.ts',
    '!src/routes/**',
    '!src/services/websocket/server.ts',
    '!src/services/kafka/client.ts',
    '!src/models/**/*.{ts,js}'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
}