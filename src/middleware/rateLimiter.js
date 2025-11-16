// Simple in-memory rate limiter (per IP)
const requestCounts = {};
const WINDOW_SIZE = 60 * 1000;   // 1 minute
const MAX_REQUESTS = 100;        // allowed requests per window

export const rateLimiter = (req, res, next) => {
  const ip = req.ip;
  const currentTime = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = [];
  }

  // keep only requests inside current time window
  requestCounts[ip] = requestCounts[ip].filter(
    (timestamp) => currentTime - timestamp < WINDOW_SIZE
  );

  if (requestCounts[ip].length >= MAX_REQUESTS) {
    return res.status(429).json({
      error: "Rate limit exceeded. Try again later.",
    });
  }

  // record request timestamp
  requestCounts[ip].push(currentTime);
  
  next();
};
