export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== "object") return obj;

  const sensitive = ["password", "token", "secret", "apikey"];

  const out = {};
  for (const k in obj) {
    if (sensitive.some((s) => k.toLowerCase().includes(s))) {
      out[k] = "***REDACTED***";
    } else {
      out[k] = obj[k];
    }
  }

  return out;
};
