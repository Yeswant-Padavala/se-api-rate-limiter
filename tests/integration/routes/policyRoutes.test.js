import request from "supertest";
import app from "../../../app.js";
import { jest } from "@jest/globals";

test("GET /api/policies", async () => {
  const res = await request(app).get("/api/policies");
  expect(res.statusCode).toBe(200);
});
