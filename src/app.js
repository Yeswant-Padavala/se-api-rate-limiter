import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";

import policyRoutes from "./routes/policyRoutes.js";
<<<<<<< HEAD
import healthRoutes from "./routes/healthRoutes.js";

=======
import metricsRoutes from "./routes/metricsRoutes.js";
>>>>>>> yp/sprint2
import { applySecurityHeaders } from "./middleware/security.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
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

app.use(enforceTLS);   // 🔐 Enforce TLS (Story 6.1-NF)
app.use(rateLimiter);  // 🔄 Rate Limiter

// 🧩 Routes
app.use("/api/policies", policyRoutes);
<<<<<<< HEAD
app.use("/api/health", healthRoutes);
=======
app.use("/metrics", metricsRoutes);
>>>>>>> yp/sprint2

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Rate Limiter Core API - Sprint 1" });
});

// 🩺 Auto-recovery every 5 seconds (simulation)
setInterval(() => {
  autoRecovery();
  console.log("Auto-recovery check executed");
}, 5000);

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

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
