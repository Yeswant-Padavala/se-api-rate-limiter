import express from "express";
import { 
  getPolicies, 
  getPolicyById,
  createPolicy, 
  updatePolicy, 
  rollbackPolicy,
  getPolicyStats
} from "../controllers/policyController.js";
import { validatePolicy } from "../middleware/validation.js";

const router = express.Router();

// GET all policies
router.get("/", getPolicies);

// GET specific policy by ID
router.get("/:id", getPolicyById);

// GET policy statistics including burst info
router.get("/:id/stats", getPolicyStats);

// POST create new policy (with burst support)
router.post("/", validatePolicy, createPolicy);

// PUT update policy (with burst support)
router.put("/:id", validatePolicy, updatePolicy);

// POST rollback policy to previous version
router.post("/:id/rollback", rollbackPolicy);

export default router;
