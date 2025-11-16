/**
 * Policy Model with Burst Traffic Support
 * 
 * Policies now include burst configuration to allow controlled traffic spikes.
 * - limit: Average requests per window (long-term rate limit)
 * - window: Time window for rate limit (e.g., "1m", "5m")
 * - burstLimit: Maximum requests allowed in a short burst
 * - burstWindow: Duration for burst allowance (e.g., "10s")
 */

// Current active policies
export const policies = [
  { 
    id: 1, 
    name: "default", 
    limit: 100, 
    window: "1m", 
    burstLimit: 150,      // Allow 150 requests in burst
    burstWindow: "10s",   // Over 10 seconds
    version: 1 
  },
  { 
    id: 2, 
    name: "premium", 
    limit: 1000, 
    window: "1m", 
    burstLimit: 1500,     // Allow 1500 requests in burst
    burstWindow: "10s",   // Over 10 seconds
    version: 1 
  }
];
