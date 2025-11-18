import { TokenBucketRateLimiter } from "../../../src/algorithms/tokenBucket.js";

const redisMock = () => {
  const store = new Map();
  return {
    async get(k) { return store.get(k); },
    async set(k, v) { store.set(k, v); }
  };
};

test("token bucket allows when tokens available", async () => {
  const redis = redisMock();
  const limiter = new TokenBucketRateLimiter({
    redisClient: redis,
    refillRate: 1,
    bucketSize: 5
  });

  const result = await limiter.isAllowed("ip1");
  expect(result.allowed).toBe(true);
});
