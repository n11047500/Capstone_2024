module.exports = {
    collectCoverage: true,
    collectCoverageFrom: [
        'database.{js,jsx}',
        'server.{js,jsx}'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['json', 'lcov', 'text', 'clover'],
    testEnvironment: 'node',
};