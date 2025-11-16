import request from "supertest";
import app from "../src/app.js";

describe("Rate Limiter Tests", () => {
  
  it("should allow the first request", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
  });

  it("should block requests after exceeding the limit", async () => {
    // send 101 requests
    for (let i = 0; i < 101; i++) {
      await request(app).get("/");
    }

    const res = await request(app).get("/");
    expect(res.statusCode).toBe(429);
    expect(res.body.error).toBe("Rate limit exceeded. Try again later.");
  });

});
