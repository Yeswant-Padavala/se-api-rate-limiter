import request from "supertest";
import app from "../../src/app.js";

describe("API Integration Test", () => {
  test("GET /api/policies should return policies", async () => {
    const res = await request(app).get("/api/policies");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.policies)).toBe(true);
  });
});
