import request from "supertest";
import express from "express";
import policyRoutes from "../../src/routes/policyRoutes.js";
import { applySecurityHeaders } from "../../src/middleware/security.js";
import helmet from "helmet";

const app = express();
app.use(express.json());
app.use(helmet());
app.use(applySecurityHeaders);
app.use("/api/policies", policyRoutes);

describe("Policy API Integration Tests", () => {
  test("GET /api/policies returns default list", async () => {
    const res = await request(app).get("/api/policies");
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test("POST /api/policies creates new policy", async () => {
    const newPolicy = { name: "test-tier", limit: 50, window: "1m" };
    const res = await request(app).post("/api/policies").send(newPolicy);

    expect(res.statusCode).toBe(201);
    expect(res.body.data.name).toBe("test-tier");
  });

  test("POST /api/policies rejects invalid payload", async () => {
    const res = await request(app).post("/api/policies").send({ limit: -1 });
    expect(res.statusCode).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  test("Security headers present on responses", async () => {
    const res = await request(app).get("/api/policies");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["x-frame-options"]).toBe("DENY");
  });
});
