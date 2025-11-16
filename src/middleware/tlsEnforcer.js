// TLS enforcement middleware (simulated for student project)

export const enforceTLS = (req, res, next) => {
    const proto = req.headers["x-forwarded-proto"] || req.protocol;
  
    // Reject HTTP traffic
    if (proto !== "https") {
      return res.status(400).json({
        error: "TLS 1.2+ is required. Plain HTTP traffic is not allowed."
      });
    }
  
    // Check TLS version (simulated)
    const tlsVersion = req.headers["x-tls-version"] || "TLSv1.3"; // default mock
  
    if (!tlsVersion.includes("1.2") && !tlsVersion.includes("1.3")) {
      return res.status(403).json({
        error: "Connection rejected: TLS 1.2 or higher required."
      });
    }
  
    // Mock certificate validation
    const certValid = true; // simulate valid cert
  
    if (!certValid) {
      return res.status(401).json({
        error: "Invalid TLS certificate."
      });
    }
  
    next();
  };
  