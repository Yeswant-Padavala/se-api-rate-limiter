import request from "supertest";
import app from "../../../app.js";

test("GET /metrics returns prometheus data", async () => {
  const res = await request(app).get("/metrics");
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain("requests_total");
});
