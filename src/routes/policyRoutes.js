import express from "express";
import { getPolicies, createPolicy, updatePolicy, rollbackPolicy } from "../controllers/policyController.js";
import { validatePolicy } from "../middleware/validation.js";

const router = express.Router();

router.get("/", getPolicies);
router.post("/", validatePolicy, createPolicy);
router.put("/:id", validatePolicy, updatePolicy);
router.post("/:id/rollback", rollbackPolicy);

export default router;
