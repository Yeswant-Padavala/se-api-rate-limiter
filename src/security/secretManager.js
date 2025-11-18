import { createVaultClient } from "./vaultClient.js";

export class SecretManager {
  constructor(path = "kv/data/rate-limiter", refreshMs = 60000) {
    this.vault = createVaultClient();
    this.path = path;
    this.cache = {};
    this.refreshMs = refreshMs;
  }

  async start() {
    await this.refresh();
    setInterval(() => this.refresh(), this.refreshMs);
  }

  async refresh() {
    const res = await this.vault.read(this.path);
    this.cache = res?.data?.data || {};
  }

  get(key) {
    return this.cache[key];
  }
}
