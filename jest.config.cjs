module.exports = {
  testEnvironment: "node",

  transform: {
    "^.+\\.js$": "babel-jest"
  },

  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  moduleFileExtensions: ["js", "json"],
  verbose: true
};
