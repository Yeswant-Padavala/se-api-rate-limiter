import vault from "node-vault";

export function createVaultClient() {
  return vault({
    apiVersion: "v1",
    endpoint: process.env.VAULT_ADDR || "http://127.0.0.1:8200",
    token: process.env.VAULT_TOKEN || "dev-token"
  });
}
