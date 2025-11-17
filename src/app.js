import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import policyRoutes from "./routes/policyRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import metricsRoutes from "./routes/metricsRoutes.js";

import { applySecurityHeaders } from "./middleware/security.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { enforceTLS } from "./middleware/tlsEnforcer.js";
import { logTLSConfig } from "./utils/tlsAuditLogger.js";

import { autoRecovery } from "./controllers/healthController.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 🧱 Middleware setup
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(applySecurityHeaders);

// 🔐 Disable TLS enforcement during tests
if (process.env.NODE_ENV !== "test") {
  app.use(enforceTLS);
}

// 🔄 Rate Limiter
app.use(rateLimiter);

// 🧩 Routes
app.use("/api/policies", policyRoutes);
app.use("/api/health", healthRoutes);
app.use("/metrics", metricsRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Rate Limiter Core API - Sprint 1" });
});

// 🩺 Auto-recovery (disabled during tests)
if (process.env.NODE_ENV !== "test") {
  setInterval(() => {
    autoRecovery();
    console.log("Auto-recovery check executed");
  }, 5000);
}

// 🛡️ TLS Configuration Audit Log
logTLSConfig({
  minVersion: "TLS 1.2",
  enforced: true,
  certificateValidation: "enabled",
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server only if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

export default app;
