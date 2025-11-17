import express from "express";
import { getHealthStatus } from "../controllers/healthController.js";

const router = express.Router();

// GET /api/health/status
router.get("/status", getHealthStatus);

export default router;
