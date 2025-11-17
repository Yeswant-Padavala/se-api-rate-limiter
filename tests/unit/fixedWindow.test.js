import { FixedWindowRateLimiter } from "../../src/algorithms/fixedWindow.js";

const redisMock = () => {
  const store = new Map();
  return {
    multi() {
      return {
        ops: [],
        incr: (k) => { store.set(k, (store.get(k) || 0) + 1); return this; },
        pexpire: () => this,
        exec: async () => [Array.from(store.values()).pop()]
      };
    }
  };
};

test("allows within limit", async () => {
  const redis = redisMock();
  const limiter = new FixedWindowRateLimiter({ redisClient: redis, windowMs: 1000, limit: 5 });
  const res = await limiter.isAllowed("user1");
  expect(res.allowed).toBe(true);
});
