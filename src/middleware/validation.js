import { body, validationResult } from "express-validator";

// Validate incoming policy data
export const validatePolicy = [
  body("name").isString().withMessage("Policy name must be a string"),
  body("limit").isInt({ gt: 0 }).withMessage("Limit must be a positive integer"),
  body("window").isString().withMessage("Window must be a string (e.g., '1m')"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
