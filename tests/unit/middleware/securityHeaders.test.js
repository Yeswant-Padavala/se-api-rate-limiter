import { applySecurityHeaders } from "../../../src/middleware/security.js";
import { jest } from "@jest/globals";

test("applies headers", () => {
  const res = { set: jest.fn() };
  const req = {};
  const next = jest.fn();

  applySecurityHeaders(req, res, next);

  expect(res.set).toHaveBeenCalled();
  expect(next).toHaveBeenCalled();
});
