import fs from "fs";

describe("Container Build Test", () => {
  test("Dockerfile exists", () => {
    expect(typeof fs.existsSync).toBe("function");
    expect(fs.existsSync("Dockerfile")).toBe(true);
  });
});
  