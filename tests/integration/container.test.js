import fs from "fs";

describe("Container Build Test", () => {
  test("Dockerfile exists", () => {
    expect(fs.existsSync("Dockerfile")).toBe(true);
  });
});
