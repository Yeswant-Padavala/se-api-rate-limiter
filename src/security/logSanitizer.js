const SENSITIVE_PATTERNS = [/password/i, /secret/i, /token/i, /apikey/i, /api_key/i];

export function sanitizeObject(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const clone = Array.isArray(obj) ? [...obj] : {...obj};
  for (const k of Object.keys(clone)) {
    if (SENSITIVE_PATTERNS.some(rx => rx.test(k))) clone[k] = "***REDACTED***";
    else if (typeof clone[k] === "object") clone[k] = sanitizeObject(clone[k]);
  }
  return clone;
}
