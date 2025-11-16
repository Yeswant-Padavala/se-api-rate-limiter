import { body, validationResult } from "express-validator";

/**
 * Validation Middleware for Rate Limit Policies with Burst Support
 * 
 * Validates policy objects including new burst parameters.
 */

/**
 * Validate duration format (e.g., "1m", "10s", "5m")
 */
const validateDuration = (value) => {
  const durationRegex = /^\d+[smh]$/;
  if (!durationRegex.test(value)) {
    throw new Error('Duration must be in format "1m", "10s", "5m", etc.');
  }
  return true;
};

/**
 * Main policy validation middleware
 * 
 * Required fields:
 * - name: string
 * - limit: positive integer
 * - window: duration string (e.g., "1m")
 * 
 * Optional fields (for burst support):
 * - burstLimit: positive integer (should be >= limit)
 * - burstWindow: duration string
 */
export const validatePolicy = [
  // Core policy fields (required)
  body("name")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Policy name is required and must be a string"),

  body("limit")
    .isInt({ gt: 0 })
    .withMessage("Limit must be a positive integer"),

  body("window")
    .custom(validateDuration)
    .withMessage("Window must be in format like '1m', '5m', '1h', '10s'"),

  // Burst configuration fields (optional)
  body("burstLimit")
    .optional()
    .isInt({ gt: 0 })
    .withMessage("Burst limit must be a positive integer"),

  body("burstWindow")
    .optional()
    .custom(validateDuration)
    .withMessage("Burst window must be in format like '1m', '5m', '10s'"),

  // Custom validation to ensure burstLimit >= limit
  body().custom((body) => {
    if (body.burstLimit && body.limit && body.burstLimit < body.limit) {
      throw new Error(
        "Burst limit must be greater than or equal to average limit"
      );
    }
    return true;
  }),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        hint: "Check policy configuration: name (string), limit (int), window (e.g., '1m'), burstLimit (int, optional), burstWindow (string, optional)"
      });
    }
    next();
  }
];
