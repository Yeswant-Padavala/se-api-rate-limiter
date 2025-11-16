import request from "supertest";
import app from "../../src/app.js";

describe("E2E: Policy API Integration Tests", () => {
  
  test("GET /api/policies returns all policies", async () => {
    const res = await request(app).get("/api/policies");

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  test("POST /api/policies creates a new policy", async () => {
    const payload = {
      name: "integration-policy",
      limit: 20,
      window: "1m",
    };

    const res = await request(app).post("/api/policies").send(payload);

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("integration-policy");
  });

});
