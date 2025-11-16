/**
 * Burst-Aware Rate Limiter Middleware
 * 
 * Implements token bucket algorithm to handle:
 * - Controlled bursts of traffic up to burstLimit
 * - Average usage control within time window
 * - Per-IP/client rate limiting
 * 
 * Token Bucket Algorithm:
 * 1. Tokens are added at a constant refill rate (limit/window)
 * 2. Burst capacity is the max tokens that can accumulate (burstLimit)
 * 3. Each request consumes 1 token
 * 4. If bucket has tokens, request is allowed; otherwise rejected
 */

import TokenBucket from "../models/burstRateLimiterModel.js";
import { policies } from "../models/policyModel.js";

// Store token buckets for each IP
const clientBuckets = new Map();

/**
 * Parse duration string (e.g., "1m", "10s") to milliseconds
 * @param {string} duration - Duration string
 * @returns {number} - Duration in milliseconds
 */
function parseDuration(duration) {
  const value = parseInt(duration);
  const unit = duration.replace(/\d+/g, '');

  const unitMap = {
    's': 1000,           // seconds
    'm': 60 * 1000,      // minutes
    'h': 60 * 60 * 1000, // hours
  };

  return value * (unitMap[unit] || 1000);
}

/**
 * Get or create token bucket for a client
 * @param {string} clientId - Client identifier (IP address)
 * @param {Object} policy - Policy object with limit, window, burstLimit, burstWindow
 * @returns {TokenBucket} - Token bucket instance
 */
function getOrCreateBucket(clientId, policy) {
  if (!clientBuckets.has(clientId)) {
    // Convert window to milliseconds
    const windowMs = parseDuration(policy.window);
    
    // Calculate refill rate: tokens per millisecond
    const refillRate = policy.limit / windowMs;
    
    // Burst capacity is burstLimit (or fall back to limit if not specified)
    const burstCapacity = policy.burstLimit || policy.limit;
    
    // Create new bucket
    const bucket = new TokenBucket(refillRate, burstCapacity);
    clientBuckets.set(clientId, bucket);
  }

  return clientBuckets.get(clientId);
}

/**
 * Update bucket when policy changes
 * @param {string} clientId - Client identifier
 * @param {Object} policy - Updated policy
 */
function updateBucketPolicy(clientId, policy) {
  if (clientBuckets.has(clientId)) {
    const windowMs = parseDuration(policy.window);
    const refillRate = policy.limit / windowMs;
    const burstCapacity = policy.burstLimit || policy.limit;

    const bucket = clientBuckets.get(clientId);
    bucket.refillRate = refillRate;
    bucket.burstCapacity = burstCapacity;
    bucket.tokens = Math.min(bucket.tokens, burstCapacity);
  }
}

/**
 * Clear bucket for a specific client (e.g., when policy is deleted)
 * @param {string} clientId - Client identifier
 */
function clearBucket(clientId) {
  clientBuckets.delete(clientId);
}

/**
 * Burst-aware rate limiter middleware
 * Applies token bucket algorithm based on policies
 * 
 * Response headers added:
 * - X-RateLimit-Limit: Average limit
 * - X-RateLimit-Remaining: Tokens available
 * - X-RateLimit-Burst-Limit: Burst capacity
 * - X-RateLimit-Burst-Remaining: Current tokens (shows burst usage)
 */
export const burstRateLimiter = (req, res, next) => {
  const clientIp = req.ip;
  const currentTime = Date.now();

  // Use default policy if none specified in request
  const policy = req.policy || policies[0];

  try {
    // Get or create token bucket for this client
    const bucket = getOrCreateBucket(clientIp, policy);

    // Try to consume a token
    const allowed = bucket.tryConsume(1, currentTime);

    // Get bucket stats for response headers
    const stats = bucket.getStats(currentTime);

    // Always add rate limit headers
    res.set({
      'X-RateLimit-Limit': policy.limit,
      'X-RateLimit-Burst-Limit': policy.burstLimit || policy.limit,
      'X-RateLimit-Remaining': Math.floor(stats.availableTokens),
      'X-RateLimit-Burst-Remaining': Math.floor(stats.availableTokens),
    });

    if (!allowed) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil((1 - stats.availableTokens) / stats.refillRate / 1000),
        rateLimit: {
          limit: policy.limit,
          window: policy.window,
          burstLimit: policy.burstLimit || policy.limit,
          burstWindow: policy.burstWindow || policy.window,
        },
      });
    }

    // Store bucket reference in request for potential later use
    req.rateLimitStats = stats;

    next();
  } catch (error) {
    console.error("Rate limiter error:", error);
    // Don't block request if there's an error in rate limiter
    next();
  }
};

/**
 * Get rate limit status for a specific client
 * @param {string} clientId - Client IP address
 * @param {Object} policy - Policy to check against
 * @returns {Object} - Status object
 */
export const getRateLimitStatus = (clientId, policy) => {
  const bucket = clientBuckets.get(clientId);

  if (!bucket) {
    return {
      status: "No data",
      clientId,
      policy: {
        limit: policy.limit,
        window: policy.window,
        burstLimit: policy.burstLimit || policy.limit,
        burstWindow: policy.burstWindow || policy.window,
      },
    };
  }

  const stats = bucket.getStats();
  return {
    status: "Active",
    clientId,
    availableTokens: stats.availableTokens,
    burstCapacity: stats.burstCapacity,
    refillRate: stats.refillRate,
    lastRefillTime: new Date(stats.lastRefillTime).toISOString(),
    policy: {
      limit: policy.limit,
      window: policy.window,
      burstLimit: policy.burstLimit || policy.limit,
      burstWindow: policy.burstWindow || policy.window,
    },
  };
};

/**
 * Reset rate limit for a specific client
 * @param {string} clientId - Client IP address
 */
export const resetRateLimit = (clientId) => {
  clearBucket(clientId);
};

/**
 * Get all active rate limit buckets (for monitoring)
 * @returns {Array} - Array of bucket status objects
 */
export const getAllRateLimitStatus = () => {
  const status = [];
  clientBuckets.forEach((bucket, clientId) => {
    const stats = bucket.getStats();
    status.push({
      clientId,
      availableTokens: stats.availableTokens,
      burstCapacity: stats.burstCapacity,
      refillRate: stats.refillRate,
      lastRefillTime: new Date(stats.lastRefillTime).toISOString(),
    });
  });
  return status;
};

// Export helper functions for policy management
export { getOrCreateBucket, updateBucketPolicy, clearBucket, parseDuration };
