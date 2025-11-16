import express from "express";
import { systemHealthCheck, getHealthyNodes } from "../controllers/healthController.js";

const router = express.Router();

router.get("/", systemHealthCheck);
router.get("/healthy", getHealthyNodes);

export default router;
