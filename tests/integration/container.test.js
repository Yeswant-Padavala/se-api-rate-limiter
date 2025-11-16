describe("Container Build Test", () => {
    test("Dockerfile exists", () => {
      const fs = require("fs");
      expect(fs.existsSync("Dockerfile")).toBe(true);
    });
  });
  