module.exports = {
  testEnvironment: "node",

  // Enable ESM via Babel
  transform: {
    "^.+\\.js$": "babel-jest"
  },

  extensionsToTreatAsEsm: [".js"],

  roots: ["<rootDir>/tests"],
  collectCoverage: true,
  collectCoverageFrom: ["src/**/*.js"],
  moduleFileExtensions: ["js", "json"],
  verbose: true
};
