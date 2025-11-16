import fs from "fs";
import path from "path";

export const logTLSConfig = (config) => {
  const filePath = path.join("tls-audit.log");

  const entry = `[${new Date().toISOString()}] TLS Config: ${JSON.stringify(config)}\n`;

  fs.appendFileSync(filePath, entry);
};
