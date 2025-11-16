/**
 * Burst Rate Limiter Model
 * 
 * Implements Token Bucket algorithm for burst traffic handling.
 * Allows controlled bursts of traffic up to a defined threshold while maintaining
 * long-term average rate limits.
 * 
 * Key Concepts:
 * - Tokens: Represent allowed requests
 * - Refill Rate: How many tokens are added per unit time (limit / window)
 * - Burst Capacity: Maximum tokens that can accumulate (burstLimit)
 * - Average Rate: Normal requests allowed per window (limit)
 */

class TokenBucket {
  /**
   * Initialize a token bucket for an IP/client
   * @param {number} refillRate - Tokens to add per millisecond (limit / window in ms)
   * @param {number} burstCapacity - Maximum tokens allowed in bucket (burst limit)
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  constructor(refillRate, burstCapacity, currentTime = Date.now()) {
    this.refillRate = refillRate;
    this.burstCapacity = burstCapacity;
    this.tokens = burstCapacity; // Start with full capacity
    this.lastRefillTime = currentTime;
  }

  /**
   * Refill tokens based on elapsed time
   * @param {number} currentTime - Current timestamp in milliseconds
   */
  refill(currentTime) {
    const timePassed = currentTime - this.lastRefillTime;
    const tokensToAdd = timePassed * this.refillRate;
    
    this.tokens = Math.min(
      this.burstCapacity,
      this.tokens + tokensToAdd
    );
    this.lastRefillTime = currentTime;
  }

  /**
   * Try to consume tokens from the bucket
   * @param {number} tokensNeeded - Number of tokens to consume (default 1)
   * @param {number} currentTime - Current timestamp in milliseconds
   * @returns {boolean} - True if tokens were available, false otherwise
   */
  tryConsume(tokensNeeded = 1, currentTime = Date.now()) {
    this.refill(currentTime);

    if (this.tokens >= tokensNeeded) {
      this.tokens -= tokensNeeded;
      return true;
    }
    return false;
  }

  /**
   * Get current token count (for monitoring)
   * @param {number} currentTime - Current timestamp in milliseconds
   * @returns {number} - Current number of available tokens
   */
  getTokenCount(currentTime = Date.now()) {
    this.refill(currentTime);
    return this.tokens;
  }

  /**
   * Get bucket statistics
   * @param {number} currentTime - Current timestamp in milliseconds
   * @returns {Object} - Statistics object
   */
  getStats(currentTime = Date.now()) {
    this.refill(currentTime);
    return {
      availableTokens: this.tokens,
      burstCapacity: this.burstCapacity,
      refillRate: this.refillRate,
      lastRefillTime: this.lastRefillTime,
    };
  }
}

export default TokenBucket;
