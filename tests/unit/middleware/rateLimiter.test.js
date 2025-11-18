import { jest } from "@jest/globals";
import rateLimiter from "../../../src/middleware/rateLimiter.js";

test("blocks when limiter returns not allowed", async () => {
  const mockRedis = {
    incr: jest.fn().mockResolvedValue(101),
    pexpire: jest.fn().mockResolvedValue(null)
  };

  const req = { ip: "127.0.0.1" };
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const next = jest.fn();

  const limiter = rateLimiter(mockRedis);
  await limiter(req, res, next);

  expect(res.status).toHaveBeenCalledWith(429);
  expect(res.json).toHaveBeenCalledWith({ error: "rate_limit_exceeded" });
  expect(next).not.toHaveBeenCalled();
});
