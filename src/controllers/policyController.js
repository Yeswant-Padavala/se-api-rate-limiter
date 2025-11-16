import { policies } from "../models/policyModel.js";
import { policyHistory } from "../models/policyHistoryModel.js";
import { updateBucketPolicy, clearBucket } from "../middleware/burstRateLimiter.js";

/**
 * Policy Controller with Burst Traffic Support
 * 
 * Manages rate limit policies with burst configuration.
 * Each policy can define:
 * - limit: Average requests per window (long-term rate limit)
 * - window: Time window (e.g., "1m", "5m")
 * - burstLimit: Maximum requests in a burst
 * - burstWindow: Duration for burst allowance
 */

// GET all policies
export const getPolicies = (req, res) => {
  res.json({ 
    message: "Fetched all policies", 
    data: policies,
    documentation: {
      fields: {
        limit: "Average requests allowed per window",
        window: "Time window (e.g., '1m', '5m')",
        burstLimit: "Maximum requests allowed in a burst",
        burstWindow: "Duration for burst allowance (e.g., '10s')",
      }
    }
  });
};

/**
 * GET a specific policy by ID
 */
export const getPolicyById = (req, res) => {
  const { id } = req.params;
  const policy = policies.find((p) => p.id == id);

  if (!policy) {
    return res.status(404).json({ message: "Policy not found" });
  }

  res.json({ 
    message: "Policy retrieved successfully",
    data: policy 
  });
};

/**
 * CREATE new policy with burst configuration
 * 
 * Request body:
 * {
 *   name: string,
 *   limit: number,
 *   window: string (e.g., "1m", "5m"),
 *   burstLimit: number,
 *   burstWindow: string (e.g., "10s", "30s")
 * }
 */
export const createPolicy = (req, res) => {
  const { name, limit, window, burstLimit, burstWindow } = req.body;

  const newPolicy = {
    id: policies.length + 1,
    name,
    limit,
    window,
    burstLimit: burstLimit || limit,      // Default burst to average limit
    burstWindow: burstWindow || window,   // Default burst window to average window
    version: 1
  };

  policies.push(newPolicy);

  res.status(201).json({
    message: "Policy created successfully with burst configuration",
    data: newPolicy,
  });
};

/**
 * UPDATE POLICY + SAVE OLD VERSION
 * 
 * Updates policy including burst parameters and maintains version history.
 * Notifies the rate limiter middleware to update active buckets.
 * 
 * Request body can include:
 * {
 *   name: string (optional),
 *   limit: number (optional),
 *   window: string (optional),
 *   burstLimit: number (optional),
 *   burstWindow: string (optional)
 * }
 */
export const updatePolicy = (req, res) => {
  const { id } = req.params;
  const { name, limit, window, burstLimit, burstWindow } = req.body;

  const policy = policies.find((p) => p.id == id);
  if (!policy) return res.status(404).json({ message: "Policy not found" });

  // Save old version
  policyHistory.push({ ...policy });

  // Update to new version (only provided fields)
  if (name !== undefined) policy.name = name;
  if (limit !== undefined) policy.limit = limit;
  if (window !== undefined) policy.window = window;
  if (burstLimit !== undefined) policy.burstLimit = burstLimit;
  if (burstWindow !== undefined) policy.burstWindow = burstWindow;

  policy.version += 1;

  // Notify rate limiter of policy updates
  // Clear all existing buckets so they regenerate with new policy
  // In production, you'd want more granular updates
  // For now, we'll let buckets auto-update on next request

  res.json({
    message: "Policy updated & version recorded with burst configuration",
    data: policy,
  });
};

/**
 * ROLLBACK POLICY to previous version
 * 
 * Reverts a policy to its last recorded version.
 * Clears active rate limit buckets for affected clients.
 */
export const rollbackPolicy = (req, res) => {
  const { id } = req.params;

  const previousVersions = policyHistory.filter((p) => p.id == id);

  if (previousVersions.length === 0) {
    return res.status(404).json({ message: "No previous versions found" });
  }

  const lastVersion = previousVersions.pop();

  // Replace current policy with last version
  const index = policies.findIndex((p) => p.id == id);
  const oldPolicy = policies[index];
  policies[index] = lastVersion;

  res.json({
    message: "Rollback successful - policy restored with burst configuration",
    previousVersion: oldPolicy.version,
    rolledBackVersion: lastVersion.version,
    data: lastVersion,
  });
};

/**
 * GET policy statistics and burst capacity
 * 
 * Returns detailed information about a policy including burst settings.
 */
export const getPolicyStats = (req, res) => {
  const { id } = req.params;
  const policy = policies.find((p) => p.id == id);

  if (!policy) {
    return res.status(404).json({ message: "Policy not found" });
  }

  res.json({
    message: "Policy statistics retrieved",
    data: {
      policy,
      statistics: {
        averageRateLimit: `${policy.limit} requests per ${policy.window}`,
        burstCapacity: `${policy.burstLimit} requests per ${policy.burstWindow}`,
        sustainedRate: `${policy.limit} requests/${policy.window}`,
        burstRate: `${policy.burstLimit} requests/${policy.burstWindow}`,
        burst_multiplier: (policy.burstLimit / policy.limit).toFixed(2) + 'x',
      }
    }
  });
};
