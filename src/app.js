// app.js
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimitMiddleware from "./src/middleware/rateLimiter.js";          // your limiter middleware
import policyRoutes from "./src/routes/policyRoutes.js";                    // Sprint 1
import metricsRoutes from "./src/routes/metricsRoutes.js";                  // Sprint 2
import { SecretManager } from "./src/security/secretManager.js";            // Story 6.2
import { sanitizeObject } from "./src/security/logSanitizer.js";            // Story 6.2
import Redis from "ioredis";

const app = express();
app.use(express.json());

// ------------------------------
// 🔐 1. Load Secrets from Vault
// ------------------------------
const secrets = new SecretManager("kv/data/rate-limiter", 60_000);

(async () => {
  console.log("🔐 Loading secrets from Vault...");
  await secrets.start();
  console.log("🔐 Secrets loaded.");
})();

// ------------------------------
// 📝 2. Logging (Sanitized)
// ------------------------------
morgan.token("body", (req) => JSON.stringify(sanitizeObject(req.body)));

app.use(
  morgan(':method :url :status :response-time ms - :body', {
    skip: (req) =>
      req.path === "/metrics" || req.path === "/health"  // avoid noisy logs
  })
);

// ------------------------------
// 🛡️ 3. Security Headers
// ------------------------------
app.use(helmet());

// ------------------------------
// 🗄️ 4. Redis Connection (Using Vault Secrets)
// ------------------------------
let redis;
setTimeout(() => {
  // wait ~1 sec to ensure SecretManager has loaded first time
  redis = new Redis({
    host: secrets.get("REDIS_HOST") || "localhost",
    port: secrets.get("REDIS_PORT") || 6379,
    password: secrets.get("REDIS_PASSWORD") || undefined,
    enableReadyCheck: true
  });

  redis.on("connect", () => console.log("🔌 Redis connected"));
  redis.on("error", (err) => console.error("❌ Redis error:", err));
}, 1000);

// ------------------------------
// 🚦 5. Rate Limiter Middleware
// (Uses algorithm factory internally)
// ------------------------------
app.use(rateLimitMiddleware(redis));

// ------------------------------
// 📘 6. Routes
// ------------------------------
app.use("/api/policies", policyRoutes);   // Policy CRUD
app.use("/metrics", metricsRoutes);       // Prometheus
app.get("/health", (req, res) => res.json({ status: "ok" }));

// A simple root route (useful for API Gateway integration tests)
app.get("/", (req, res) => {
  res.json({ message: "Rate Limiter Backend OK" });
});

// ------------------------------
// 🧵 7. Error Handler (Sanitizes Output)
// ------------------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", sanitizeObject({ message: err.message, stack: err.stack }));
  res.status(500).json({ error: "internal_server_error" });
});

// ------------------------------
// 🚀 8. Start Server
// ------------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Rate Limiter running on http://localhost:${PORT}`);
});

export default app;
