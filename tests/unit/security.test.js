import { jest } from "@jest/globals";

import { applySecurityHeaders } from "../../src/middleware/security.js";

describe("Security Middleware Tests", () => {
  test("sets required security headers", () => {
    const req = {};
    const res = {
      setHeader: jest.fn(),
    };
    const next = jest.fn();

    applySecurityHeaders(req, res, next);

    expect(res.setHeader).toHaveBeenCalledWith("X-Content-Type-Options", "nosniff");
    expect(res.setHeader).toHaveBeenCalledWith("X-Frame-Options", "DENY");
    expect(res.setHeader).toHaveBeenCalledWith("X-XSS-Protection", "1; mode=block");
    expect(next).toHaveBeenCalled();
  });
});
