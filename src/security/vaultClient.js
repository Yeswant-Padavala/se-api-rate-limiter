import vault from "node-vault";

export function createVaultClient() {
  const client = vault({
    apiVersion: "v1",
    endpoint: process.env.VAULT_ADDR || "http://127.0.0.1:8200",
    token: process.env.VAULT_TOKEN // prefer AppRole-based token or short-lived token
  });
  return client;
}
