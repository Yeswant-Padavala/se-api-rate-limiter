describe("Container Build Test", () => {
    test("Dockerfile exists", async () => {
      const fs = await import("fs");
      const existsSync = fs.existsSync || fs.default?.existsSync;
      expect(typeof existsSync).toBe("function");
      expect(existsSync("Dockerfile")).toBe(true);
    });
  });
  