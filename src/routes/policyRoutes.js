import express from "express";
import { getPolicies, createPolicy } from "../controllers/policyController.js";
import { validatePolicy } from "../middleware/validation.js";

const router = express.Router();

// 🟢 GET all policies
router.get("/", getPolicies);

// 🟣 POST new policy
router.post("/", validatePolicy, createPolicy);

export default router;
