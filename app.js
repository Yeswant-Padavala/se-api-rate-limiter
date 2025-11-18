import express from "express";
import helmet from "helmet";
import morgan from "morgan";

// Security
import { sanitizeObject } from "./src/security/logSanitizer.js";
import { SecretManager } from "./src/security/secretManager.js";

// Redis
import Redis from "ioredis";

// Routes
import policyRoutes from "./src/routes/policyRoutes.js";
import metricsRoutes from "./src/routes/metricsRoutes.js";

// Rate Limiter
import rateLimiter from "./src/middleware/rateLimiter.js";

const app = express();
app.use(express.json());

// Detect test environment
const isTest = process.env.NODE_ENV === "test";

// ------------------------------------------------------------
// 1️⃣ Vault Secret Manager (Disabled in tests)
// ------------------------------------------------------------
let secrets = null;
if (!isTest) {
  secrets = new SecretManager("kv/data/rate-limiter", 60000);
  secrets.start();
}

// ------------------------------------------------------------
// 2️⃣ Sanitized Logging (disabled for tests)
// ------------------------------------------------------------
if (!isTest) {
  morgan.token("body", (req) => JSON.stringify(sanitizeObject(req.body)));
  app.use(
    morgan(":method :url :status :response-time ms - :body", {
      skip: (req) => req.path === "/metrics" || req.path === "/health",
    })
  );
}

// ------------------------------------------------------------
// 3️⃣ Security Headers
// ------------------------------------------------------------
app.use(helmet());

// ------------------------------------------------------------
// 4️⃣ Redis Client (Mocked / disabled in tests)
// ------------------------------------------------------------
let redis = null;

if (!isTest) {
  redis = new Redis({
    host: secrets.get("REDIS_HOST") || "127.0.0.1",
    port: secrets.get("REDIS_PORT") || 6379,
    password: secrets.get("REDIS_PASSWORD") || undefined,
  });

  redis.on("connect", () => console.log("🔌 Redis connected"));
  redis.on("error", (err) => console.error("❌ Redis error:", err));
}

// ------------------------------------------------------------
// 5️⃣ Rate Limiter Middleware
// (If redis is null, limiter becomes a no-op for tests)
// ------------------------------------------------------------
app.use(rateLimiter(redis));

// ------------------------------------------------------------
// 6️⃣ Routes
// ------------------------------------------------------------
app.get("/", (req, res) => {
  res.json({ message: "Rate Limiter OK" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/policies", policyRoutes);
app.use("/metrics", metricsRoutes);

// ------------------------------------------------------------
// 7️⃣ Express Error Handler
// ------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error(
    "❌ Error:",
    sanitizeObject({ message: err.message, stack: err.stack })
  );
  res.status(500).json({ error: "internal_server_error" });
});

export default app;
