import { FixedWindowRateLimiter } from "./fixedWindow.js";
import { TokenBucketRateLimiter } from "./tokenBucket.js";

/**
 * Factory to choose algorithm dynamically.
 */
export function createRateLimiter(type, options) {
  switch (type) {
    case "fixed":
      return new FixedWindowRateLimiter(options);
    case "token":
      return new TokenBucketRateLimiter(options);
    default:
      throw new Error(`Unknown algorithm type: ${type}`);
  }
}
