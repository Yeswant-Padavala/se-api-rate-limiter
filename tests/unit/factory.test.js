import { createRateLimiter } from "../../src/algorithms/factory.js";

test("creates FixedWindow limiter", () => {
  const limiter = createRateLimiter("fixed", { redisClient: {}, windowMs: 1000, limit: 10 });
  expect(limiter.constructor.name).toBe("FixedWindowRateLimiter");
});

test("throws error on invalid type", () => {
  expect(() => createRateLimiter("xyz", {})).toThrow();
});
