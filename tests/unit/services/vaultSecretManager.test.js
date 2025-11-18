import { SecretManager } from "../../../src/security/secretManager.js";

test("loads secrets from vault", async () => {
  const mockClient = {
    read: jest.fn().mockResolvedValue({
      data: { data: { REDIS_PASSWORD: "secret-pass" }}
    })
  };

  const mgr = new SecretManager("kv/data/rate-limiter");
  mgr.vault = mockClient;

  await mgr.refresh();

  expect(mgr.get("REDIS_PASSWORD")).toBe("secret-pass");
});
