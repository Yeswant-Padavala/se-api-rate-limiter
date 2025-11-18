module.exports = {
  testEnvironment: "node",
  transform: {},
  verbose: true,
  roots: ["se-api-rate-limiter/tests"],
  moduleFileExtensions: ["js", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage"
};
