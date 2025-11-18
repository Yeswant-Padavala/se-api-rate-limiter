import request from "supertest";
import app from "../../../app.js";
import { jest } from "@jest/globals";

test("GET /metrics returns prometheus data", async () => {
  const res = await request(app).get("/metrics");
  expect(res.statusCode).toBe(200);
  expect(res.text).toContain("requests_total");
});
