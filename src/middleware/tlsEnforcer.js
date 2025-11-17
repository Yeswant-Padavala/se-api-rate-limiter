// TLS enforcement middleware with audit logging (Student Project Simulation)
import { logTLSActivity } from "../utils/tlsAuditLogger.js";

export const enforceTLS = (req, res, next) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;

  // Log protocol used
  logTLSActivity(`Incoming request from ${req.ip} using protocol: ${proto}`);

  // Reject HTTP traffic
  if (proto !== "https") {
    logTLSActivity("Blocked request — Non-HTTPS traffic detected");
    return res.status(400).json({
      error: "TLS 1.2+ is required. Plain HTTP traffic is not allowed."
    });
  }

  // Check TLS version (simulated)
  const tlsVersion = req.headers["x-tls-version"] || "TLSv1.3";

  logTLSActivity(`TLS version detected: ${tlsVersion}`);

  if (!tlsVersion.includes("1.2") && !tlsVersion.includes("1.3")) {
    logTLSActivity("Rejected request — TLS version below 1.2");
    return res.status(403).json({
      error: "Connection rejected: TLS 1.2 or higher required."
    });
  }

  // Mock certificate validation (always true for this project)
  const certValid = true; 

  if (!certValid) {
    logTLSActivity("Invalid TLS certificate detected — request denied");
    return res.status(401).json({
      error: "Invalid TLS certificate."
    });
  }

  logTLSActivity("TLS validation passed successfully");
  next();
};
