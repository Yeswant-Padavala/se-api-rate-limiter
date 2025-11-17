import express from "express";
import {
  getPolicies,
  createPolicy,
  updatePolicyController,
  getPolicyHistory,
  rollbackPolicy
} from "../controllers/policyController.js";
import { validatePolicy } from "../middleware/validation.js";

const router = express.Router();

// GET — list policies
router.get("/", getPolicies);

// POST — create policy
router.post("/", validatePolicy, createPolicy);

// PUT — Update policy
router.put("/:id", validatePolicy, updatePolicyController);

// GET — See all versions
router.get("/:id/history", getPolicyHistory);

// POST — Rollback
router.post("/:id/rollback/:version", rollbackPolicy);

export default router;
  