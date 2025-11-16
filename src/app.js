import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import policyRoutes from "./routes/policyRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";

import { applySecurityHeaders } from "./middleware/security.js";
import { burstRateLimiter } from "./middleware/burstRateLimiter.js";  // 🔄 Updated: Burst-aware rate limiter
import { enforceTLS } from "./middleware/tlsEnforcer.js";   // ✅ TLS MIDDLEWARE
import { logTLSConfig } from "./utils/tlsAuditLogger.js";   // ✅ TLS AUDIT LOGGER

import { autoRecovery } from "./controllers/healthController.js";

const app = express();
const PORT = process.env.PORT || 3000;

// 🧱 Middleware setup
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(applySecurityHeaders);

app.use(enforceTLS);        // 🔐 Enforce TLS (Story 6.1-NF)
app.use(burstRateLimiter);  // 🔄 Burst-aware Rate Limiter (Story 2)

// 🧩 Routes
app.use("/api/policies", policyRoutes);
app.use("/api/health", healthRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ 
    message: "Rate Limiter Core API - Sprint 1",
    features: [
      "burst-traffic-handling",
      "policy-management",
      "rate-limiting",
      "health-monitoring",
      "tls-enforcement"
    ]
  });
});

// 🩺 Auto-recovery every 5 seconds (simulation)
// Only set interval in production, not in test environment
let autoRecoveryInterval;
if (process.env.NODE_ENV !== "test") {
  autoRecoveryInterval = setInterval(() => {
    autoRecovery();
    console.log("Auto-recovery check executed");
  }, 5000);
}

// 🛡️ TLS Configuration Audit Log
if (process.env.NODE_ENV !== "test") {
  logTLSConfig({
    minVersion: "TLS 1.2",
    enforced: true,
    certificateValidation: "enabled",
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server (only if not in test environment)
let server;
if (process.env.NODE_ENV !== "test") {
  server = app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
}

// Export cleanup function for tests
export const cleanup = () => {
  if (autoRecoveryInterval) {
    clearInterval(autoRecoveryInterval);
  }
  if (server) {
    server.close();
  }
};

export default app;
