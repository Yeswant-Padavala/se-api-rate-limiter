import { FixedWindowRateLimiter } from "../../../src/algorithms/fixedWindow.js";
import { jest } from "@jest/globals";

test("allows within limit", async () => {
  const store = new Map();
  const redis = {
    multi() {
      return {
        incr: (k) => {
          store.set(k, (store.get(k) || 0) + 1);
          return this;
        },
        pexpire: () => this,
        exec: async () => [store.values().next().value]
      };
    }
  };

  const limiter = new FixedWindowRateLimiter({
    redisClient: redis,
    windowMs: 1000,
    limit: 5
  });

  const res = await limiter.isAllowed("u1");
  expect(res.allowed).toBe(true);
});
