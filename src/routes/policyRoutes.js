import express from "express";
import { getPolicies, createPolicy } from "../controllers/policyController.js";
import { validatePolicy } from "../middleware/validation.js";

const router = express.Router();

router.get("/", getPolicies);
router.post("/", validatePolicy, createPolicy);

export default router;
