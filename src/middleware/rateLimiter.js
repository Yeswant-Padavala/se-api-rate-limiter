export default function rateLimiter(redis) {
  return async function (req, res, next) {
    if (!redis) return next(); // allow tests before redis is ready

    const key = req.ip || "unknown";
    const windowMs = 60000;
    const limit = 100;

    const window = Math.floor(Date.now() / windowMs);
    const redisKey = `rl:${key}:${window}`;

    const count = await redis.incr(redisKey);
    if (count === 1) {
      await redis.pexpire(redisKey, windowMs);
    }

    if (count > limit) {
      return res.status(429).json({ error: "rate_limit_exceeded" });
    }

    next();
  };
}
