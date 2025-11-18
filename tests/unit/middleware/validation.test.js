import { jest } from "@jest/globals";

import { validatePolicy } from "../../../src/middleware/validation.js";
import { validationResult } from "express-validator";

describe("Validation Middleware Tests", () => {
  test("rejects invalid payload", async () => {
    const req = { body: { name: 123, limit: -5, window: 10 } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();

    // Run validators sequentially
    for (const v of validatePolicy.slice(0, -1)) {
      await v.run(req);
    }
    validatePolicy[validatePolicy.length - 1](req, res, next);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test("accepts valid payload", async () => {
    const req = { body: { name: "basic", limit: 10, window: "1m" } };
    const res = {};
    const next = jest.fn();

    for (const v of validatePolicy.slice(0, -1)) {
      await v.run(req);
    }
    validatePolicy[validatePolicy.length - 1](req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
