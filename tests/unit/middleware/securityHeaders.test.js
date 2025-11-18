import { applySecurityHeaders } from "../../../src/middleware/security.js";
import { jest } from "@jest/globals";

test("applies headers", () => {
  const res = { setHeader: jest.fn() };
  const req = {};
  const next = jest.fn();

  applySecurityHeaders(req, res, next);

  expect(res.setHeader).toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
});
