/**
 * Fixed Window Rate Limiter
 * Resets counter every windowMs interval.
 */
export class FixedWindowRateLimiter {
  constructor({ redisClient, windowMs, limit }) {
    this.redis = redisClient;
    this.windowMs = windowMs;
    this.limit = limit;
  }

  async isAllowed(key) {
    const windowKey = `${key}:${Math.floor(Date.now() / this.windowMs)}`;
    const tx = this.redis.multi();
    tx.incr(windowKey);
    tx.pexpire(windowKey, this.windowMs);
    const [count] = await tx.exec();
    return { allowed: count <= this.limit, count };
  }
}
