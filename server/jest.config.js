module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/tests/**/*.test.js', 'tests/**/*.test.js'],
  collectCoverageFrom: [
    'controller/**/*.js',
    'model/**/*.js',
    'routers/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/coverage/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './reports',
        outputName: 'test-results.xml',
        suiteName: 'Backend Tests',
      },
    ],
    [
      '<rootDir>/utils/properDocxReporter.js',
      {
        outputPath: './reports/test-report.docx',
        pageTitle: 'Test Report',
      },
    ],
  ],
  testTimeout: 30000,
  forceExit: true,
  detectOpenHandles: true,
}
