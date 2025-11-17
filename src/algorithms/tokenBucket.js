/**
 * Token Bucket Algorithm
 * Allows bursts up to bucket size, refills at given rate.
 */
export class TokenBucketRateLimiter {
  constructor({ redisClient, refillRate, bucketSize }) {
    this.redis = redisClient;
    this.refillRate = refillRate;     // tokens per second
    this.bucketSize = bucketSize;
  }

  async isAllowed(key) {
    const now = Date.now();
    const data = JSON.parse((await this.redis.get(key)) || "{}");
    const tokens = data.tokens ?? this.bucketSize;
    const lastRefill = data.lastRefill ?? now;

    const delta = Math.max(0, now - lastRefill) / 1000;
    const refill = Math.floor(delta * this.refillRate);
    const newTokens = Math.min(this.bucketSize, tokens + refill);
    const allowed = newTokens > 0;
    const updated = {
      tokens: allowed ? newTokens - 1 : newTokens,
      lastRefill: now
    };
    await this.redis.set(key, JSON.stringify(updated));
    return { allowed, remaining: updated.tokens };
  }
}
