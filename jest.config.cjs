module.exports = {
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  moduleFileExtensions: ["js", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageReporters: ["json", "lcov", "text", "clover"],
  coverageDirectory: "coverage",
  verbose: true
};
