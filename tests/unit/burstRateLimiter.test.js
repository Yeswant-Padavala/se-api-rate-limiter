/**
 * Unit Tests for Burst Rate Limiter
 * 
 * Tests the token bucket algorithm implementation with various burst scenarios.
 * Validates:
 * - Burst capacity limits
 * - Sustained rate limiting
 * - Token refill rate
 * - Burst vs average rate tradeoffs
 */

import TokenBucket from "../src/models/burstRateLimiterModel.js";

describe("TokenBucket - Burst Rate Limiter", () => {
  /**
   * Test 1: Token consumption and burst capacity
   */
  describe("Token Consumption", () => {
    it("should start with full burst capacity", () => {
      const bucket = new TokenBucket(1, 100, 0);
      expect(bucket.tokens).toBe(100);
    });

    it("should consume tokens on successful requests", () => {
      const bucket = new TokenBucket(1, 100, 0);
      const allowed = bucket.tryConsume(1, 0);
      expect(allowed).toBe(true);
      expect(bucket.tokens).toBe(99);
    });

    it("should reject request when tokens exhausted", () => {
      const bucket = new TokenBucket(0.1, 10, 0);
      
      // Consume all tokens
      for (let i = 0; i < 10; i++) {
        bucket.tryConsume(1, 0);
      }

      // Next request should fail
      const allowed = bucket.tryConsume(1, 0);
      expect(allowed).toBe(false);
      expect(bucket.tokens).toBe(0);
    });

    it("should allow burst up to capacity", () => {
      const bucket = new TokenBucket(1, 50, 0);
      let consumed = 0;

      for (let i = 0; i < 50; i++) {
        if (bucket.tryConsume(1, 0)) {
          consumed++;
        } else {
          break;
        }
      }

      expect(consumed).toBe(50);
      expect(bucket.tokens).toBe(0);
    });

    it("should not exceed burst capacity even with refill", () => {
      const bucket = new TokenBucket(1, 100, 0);
      // Tokens should not exceed 100 even with refill
      bucket.refill(10000); // 10 seconds later
      expect(bucket.tokens).toBeLessThanOrEqual(100);
    });
  });

  /**
   * Test 2: Token refill rate
   */
  describe("Token Refill", () => {
    it("should refill tokens at the correct rate", () => {
      const refillRate = 0.1; // 1 token per 10ms
      const bucket = new TokenBucket(refillRate, 100, 0);

      // Consume all tokens
      bucket.tokens = 0;

      // Advance time by 100ms (should add 10 tokens)
      bucket.refill(100);
      expect(bucket.tokens).toBeCloseTo(10, 1);
    });

    it("should refill gradually over time", () => {
      const refillRate = 1; // 1 token per ms
      const bucket = new TokenBucket(refillRate, 100, 0);

      bucket.tokens = 0;
      bucket.refill(50); // 50ms passed
      expect(bucket.tokens).toBeCloseTo(50, 1);

      bucket.refill(75); // 75ms passed from start
      expect(bucket.tokens).toBeCloseTo(75, 1);
    });

    it("should never exceed burst capacity during refill", () => {
      const bucket = new TokenBucket(10, 50, 0);
      bucket.tokens = 30;

      // Refill way into the future
      bucket.refill(10000);

      expect(bucket.tokens).toBe(50); // Should cap at burst capacity
    });
  });

  /**
   * Test 3: Sustained rate limiting (average rate control)
   */
  describe("Sustained Rate Limiting", () => {
    it("should enforce average rate over long period", () => {
      const limit = 100; // 100 tokens
      const window = 10000; // per 10 seconds
      const refillRate = limit / window; // 10 tokens per second

      const bucket = new TokenBucket(refillRate, 100, 0);

      // Consume all burst capacity
      for (let i = 0; i < 100; i++) {
        bucket.tryConsume(1, 0);
      }
      expect(bucket.tokens).toBe(0);

      // Should not allow more requests immediately
      expect(bucket.tryConsume(1, 0)).toBe(false);

      // After 1 second, should have ~10 tokens
      bucket.refill(1000);
      expect(bucket.tokens).toBeCloseTo(10, 0);

      // Should allow ~10 requests
      let count = 0;
      while (bucket.tryConsume(1, 1000)) {
        count++;
      }
      expect(count).toBeCloseTo(10, 1);
    });

    it("should maintain long-term rate limit", () => {
      const limit = 100;
      const window = 60000; // 60 seconds
      const refillRate = limit / window;

      const bucket = new TokenBucket(refillRate, 100, 0);

      // Burst: consume 100 tokens in first request batch
      let consumed = 0;
      while (bucket.tryConsume(1, 0)) {
        consumed++;
      }
      expect(consumed).toBe(100);

      // After 60 seconds, should have accumulated exactly 100 tokens
      bucket.refill(60000);
      consumed = 0;
      while (bucket.tryConsume(1, 60000)) {
        consumed++;
      }
      expect(consumed).toBeCloseTo(100, 0);
    });
  });

  /**
   * Test 4: Real-world burst scenarios
   */
  describe("Burst Scenarios", () => {
    it("should handle legitimate traffic spike (burst)", () => {
      // Policy: 100 req/min average, 150 req/10s burst
      const average = 100;
      const window = 60000; // 1 minute
      const burstLimit = 150;
      const refillRate = average / window;

      const bucket = new TokenBucket(refillRate, burstLimit, 0);

      // Spike: 150 requests immediately (burst limit)
      let spikeAllowed = 0;
      while (bucket.tryConsume(1, 0)) {
        spikeAllowed++;
      }
      expect(spikeAllowed).toBe(150);

      // Should reject more requests
      expect(bucket.tryConsume(1, 0)).toBe(false);

      // Wait 10 seconds, should allow some requests
      bucket.refill(10000);
      expect(bucket.tokens).toBeGreaterThan(0);
      expect(bucket.tryConsume(1, 10000)).toBe(true);
    });

    it("should enforce sustained rate even after burst", () => {
      const average = 100;
      const window = 60000;
      const burstLimit = 200;
      const refillRate = average / window;

      const bucket = new TokenBucket(refillRate, burstLimit, 0);

      // Burst: consume 200 tokens
      for (let i = 0; i < 200; i++) {
        bucket.tryConsume(1, 0);
      }

      // Wait full minute for sustained rate
      bucket.refill(60000);

      // Should have exactly ~100 tokens
      expect(bucket.tokens).toBeCloseTo(100, 1);
    });

    it("should recover from exhaustion at configured rate", () => {
      const limit = 50;
      const window = 10000; // 10 seconds
      const refillRate = limit / window;

      const bucket = new TokenBucket(refillRate, 50, 0);

      // Exhaust bucket
      for (let i = 0; i < 50; i++) {
        bucket.tryConsume(1, 0);
      }
      expect(bucket.tokens).toBe(0);

      // Check recovery milestones
      bucket.refill(1000); // 1 second
      expect(bucket.tokens).toBeCloseTo(5, 1);

      bucket.refill(5000); // 5 seconds
      expect(bucket.tokens).toBeCloseTo(25, 1);

      bucket.refill(10000); // 10 seconds
      expect(bucket.tokens).toBeCloseTo(50, 1);
    });
  });

  /**
   * Test 5: Statistics and monitoring
   */
  describe("Statistics and Monitoring", () => {
    it("should provide accurate bucket statistics", () => {
      const bucket = new TokenBucket(1, 100, 0);
      const stats = bucket.getStats(0);

      expect(stats).toHaveProperty("availableTokens");
      expect(stats).toHaveProperty("burstCapacity");
      expect(stats).toHaveProperty("refillRate");
      expect(stats.burstCapacity).toBe(100);
    });

    it("should reflect changes in getStats after refill", () => {
      const bucket = new TokenBucket(1, 100, 0);
      bucket.tokens = 0;

      let stats = bucket.getStats(0);
      expect(stats.availableTokens).toBe(0);

      bucket.refill(50);
      stats = bucket.getStats(50);
      expect(stats.availableTokens).toBeCloseTo(50, 1);
    });
  });

  /**
   * Test 6: Edge cases
   */
  describe("Edge Cases", () => {
    it("should handle zero refill rate gracefully", () => {
      const bucket = new TokenBucket(0, 10, 0);
      bucket.tokens = 0;

      // Should reject all requests
      expect(bucket.tryConsume(1, 0)).toBe(false);
      expect(bucket.tryConsume(1, 10000)).toBe(false);
    });

    it("should handle very high burst capacity", () => {
      const bucket = new TokenBucket(1, 1000000, 0);
      expect(bucket.tokens).toBe(1000000);

      const allowed = bucket.tryConsume(1, 0);
      expect(allowed).toBe(true);
      expect(bucket.tokens).toBe(999999);
    });

    it("should handle fractional token consumption", () => {
      const bucket = new TokenBucket(0.5, 100, 0);
      expect(bucket.tryConsume(1, 0)).toBe(true);
      expect(bucket.tokens).toBe(99);
    });

    it("should handle time moving backward gracefully", () => {
      const bucket = new TokenBucket(1, 100, 1000);
      const tokens1 = bucket.getTokenCount(1000);
      const tokens2 = bucket.getTokenCount(500); // Time went backward

      // Should not crash and tokens should be consistent
      expect(tokens2).toBeLessThanOrEqual(tokens1);
    });
  });
});
