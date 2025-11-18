import request from "supertest";
import app from "../../../app.js";
import { jest } from "@jest/globals";

test("rate limiter enforces limits", async () => {
  for (let i = 0; i < 105; i++) {
    const res = await request(app).get("/");
    if (i >= 100) expect(res.statusCode).toBe(429);
  }
});
