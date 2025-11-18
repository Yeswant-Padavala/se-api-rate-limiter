// app.js
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

// Middlewares
import rateLimiterMiddleware from "./src/middleware/rateLimiter.js";
import policyRoutes from "./src/routes/policyRoutes.js";
import metricsRoutes from "./src/routes/metricsRoutes.js";

// Security helpers
import { SecretManager } from "./src/security/secretManager.js";
import { sanitizeObject } from "./src/security/logSanitizer.js";

// Redis
import Redis from "ioredis";

const app = express();
app.use(express.json());

// ------------------------------------
// 1️⃣ Load Secrets from Vault
// ------------------------------------
const secrets = new SecretManager("kv/data/rate-limiter", 60_000);

(async () => {
  console.log("🔐 Loading secrets from Vault...");
  await secrets.start();
  console.log("🔐 Secrets loaded.");
})();

// ------------------------------------
// 2️⃣ Logging (Sanitized)
// ------------------------------------
morgan.token("body", (req) => JSON.stringify(sanitizeObject(req.body)));

app.use(
  morgan(':method :url :status :response-time ms - :body', {
    skip: (req) => req.path === "/metrics" || req.path === "/health"
  })
);

// ------------------------------------
// 3️⃣ Security Headers
// ------------------------------------
app.use(helmet());

// ------------------------------------
// 4️⃣ Redis Connection (from Vault)
// ------------------------------------
let redis;

setTimeout(() => {
  redis = new Redis({
    host: secrets.get("REDIS_HOST") || "localhost",
    port: secrets.get("REDIS_PORT") || 6379,
    password: secrets.get("REDIS_PASSWORD") || undefined,
    enableReadyCheck: true
  });

  redis.on("connect", () => console.log("🔌 Redis connected"));
  redis.on("error", (err) => console.error("❌ Redis error:", err));
}, 1200);

// ------------------------------------
// 5️⃣ Rate Limiter Middleware
// ------------------------------------
app.use(rateLimiterMiddleware(redis));

// ------------------------------------
// 6️⃣ Application Routes
// ------------------------------------
app.get("/", (req, res) => res.json({ message: "Rate Limiter OK" }));
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/policies", policyRoutes);
app.use("/metrics", metricsRoutes);

// ------------------------------------
// 7️⃣ Error Handler
// ------------------------------------
app.use((err, req, res, next) => {
  console.error("❌ ERROR:", sanitizeObject({ message: err.message, stack: err.stack }));
  res.status(500).json({ error: "internal_server_error" });
});

export default app;
