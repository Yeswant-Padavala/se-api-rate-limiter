module.exports = {
  testEnvironment: "node",
  transform: {},
  verbose: true,
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["js", "json", "node"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  coverageDirectory: "coverage"
};
