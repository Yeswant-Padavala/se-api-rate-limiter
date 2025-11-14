<<<<<<< HEAD
import express from "express";
import { getPolicies, createPolicy } from "../controllers/policyController.js";
import { validatePolicy } from "../middleware/validation.js";

const router = express.Router();

// 🟢 GET all policies
router.get("/", getPolicies);

// 🟣 POST new policy
router.post("/", validatePolicy, createPolicy);

export default router;
=======
import express from "express";
import { getPolicies, createPolicy } from "../controllers/policyController.js";
import { validatePolicy } from "../middleware/validation.js";

const router = express.Router();

// 🟢 GET all policies
router.get("/", getPolicies);

// 🟣 POST new policy
router.post("/", validatePolicy, createPolicy);

export default router;
>>>>>>> 5786cad023d9787b6f4ab3dff286dd80d70a5df1
