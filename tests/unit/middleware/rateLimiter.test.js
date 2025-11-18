import rateLimiter from "../../../src/middleware/rateLimiter.js";
import { jest } from "@jest/globals";

test("blocks when limiter returns not allowed", async () => {
  const limiter = {
    isAllowed: jest.fn().mockResolvedValue({ allowed: false, count: 12 })
  };

  const middleware = rateLimiter(limiter);

  const req = { path: "/" };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();

  await middleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(429);
  expect(next).not.toHaveBeenCalled();
});
