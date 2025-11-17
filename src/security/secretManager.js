import { createVaultClient } from "./vaultClient.js";

export class SecretManager {
  constructor(path = "kv/data/rate-limiter", refreshMs = 60000) {
    this.client = createVaultClient();
    this.path = path;
    this.cache = {};
    this.refreshMs = refreshMs;
    this._started = false;
  }

  async start() {
    if (this._started) return;
    await this.refresh();
    this._interval = setInterval(() => this.refresh().catch(e => console.error("Secret refresh failed", e)), this.refreshMs);
    this._started = true;
  }

  async refresh() {
    const res = await this.client.read(this.path);
    // KV v2 returns { data: { data: {...}, metadata: {...} } }
    this.cache = (res && res.data && res.data.data) ? res.data.data : {};
    // NEVER log secrets: use logSanitizer where needed
  }

  get(name) {
    return this.cache[name];
  }

  stop() {
    clearInterval(this._interval);
    this._started = false;
  }
}
