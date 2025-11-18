import request from "supertest";
import app from "../../../app.js";

test("GET /api/policies", async () => {
  const res = await request(app).get("/api/policies");
  expect(res.statusCode).toBe(200);
});
