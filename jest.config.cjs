module.exports = {
  testEnvironment: "node",
  transform: {},
  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  moduleFileExtensions: ["js", "json", "node"],
  verbose: true
};
