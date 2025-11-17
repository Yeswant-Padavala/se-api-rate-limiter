import express from "express";
import { metricsHandler } from "../metrics/prometheus.js";

const router = express.Router();

// GET /metrics - Prometheus scrape endpoint
router.get("/", metricsHandler);

export default router;
