module.exports = {
  testEnvironment: "node",
  transform: {},
  verbose: true,
  roots: ["/tests"],
  moduleFileExtensions: ["js", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage"
};
