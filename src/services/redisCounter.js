export class RedisCounter {
  constructor(redis, ttlSeconds = 60) {
    this.redis = redis;
    this.ttl = ttlSeconds;
  }

  async increment(key) {
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, this.ttl);
    }
    return count;
  }
}
