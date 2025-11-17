// TLS enforcement middleware with audit logging (Student Project Simulation)
import { logTLSConfig } from "../utils/tlsAuditLogger.js";

export const enforceTLS = (req, res, next) => {
  const proto = req.headers["x-forwarded-proto"] || req.protocol;

  // Log protocol
  logTLSConfig({
    event: "protocol-check",
    ip: req.ip,
    protocol: proto
  });

  // Reject HTTP traffic
  if (proto !== "https") {
    logTLSConfig({
      event: "blocked-non-https",
      reason: "Non-HTTPS traffic detected"
    });

    return res.status(400).json({
      error: "TLS 1.2+ is required. Plain HTTP traffic is not allowed."
    });
  }

  // TLS version check (simulated)
  const tlsVersion = req.headers["x-tls-version"] || "TLSv1.3";

  logTLSConfig({
    event: "tls-version-detected",
    version: tlsVersion
  });

  if (!tlsVersion.includes("1.2") && !tlsVersion.includes("1.3")) {
    logTLSConfig({
      event: "rejected-low-tls",
      reason: "TLS version below 1.2"
    });

    return res.status(403).json({
      error: "Connection rejected: TLS 1.2 or higher required."
    });
  }

  // Mock certificate validation (always passes in student project)
  const certValid = true;

  if (!certValid) {
    logTLSConfig({
      event: "invalid-certificate",
      reason: "Certificate validation failed"
    });

    return res.status(401).json({
      error: "Invalid TLS certificate."
    });
  }

  // Final success log
  logTLSConfig({
    event: "tls-validation-success",
    path: req.path
  });

  next();
};
