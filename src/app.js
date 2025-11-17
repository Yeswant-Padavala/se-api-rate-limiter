import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import policyRoutes from "./routes/policyRoutes.js";
import metricsRoutes from "./routes/metricsRoutes.js";
import { applySecurityHeaders } from "./middleware/security.js";
import { rateLimiter } from "./middleware/rateLimiter.js";   // ✅ RATE LIMITER IMPORT

const app = express();
const PORT = process.env.PORT || 3000;

// 🧱 Middleware setup
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(applySecurityHeaders);
app.use(rateLimiter);   // ✅ APPLY RATE LIMITER HERE

// 🧩 Routes
app.use("/api/policies", policyRoutes);
app.use("/metrics", metricsRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Rate Limiter Core API - Sprint 1" });
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

export default app;
