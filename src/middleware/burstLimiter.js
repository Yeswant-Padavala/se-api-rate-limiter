// Token Bucket Burst Limiter

export function burstLimiter(ratePerSec, burstCapacity) {
  let tokens = burstCapacity;        // max burst size
  let lastRefill = Date.now();       // last refill timestamp

  return (req, res, next) => {
    const now = Date.now();
    const elapsed = (now - lastRefill) / 1000;  // convert ms → seconds

    // Refill tokens based on elapsed time
    tokens = Math.min(
      burstCapacity,
      tokens + elapsed * ratePerSec
    );

    lastRefill = now;

    // Allow request if token is available
    if (tokens >= 1) {
      tokens -= 1;
      return next();
    }

    // Otherwise block request
    return res.status(429).json({
      error: "Burst limit exceeded",
      retryAfter: 60
    });
  };
}
