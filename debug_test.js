// Quick test to check what's returning 400
process.env.NODE_ENV = "test";

import request from "supertest";
import app from "./src/app.js";

console.log("\n🧪 Testing GET / ...");
const res = await request(app).get("/");
console.log("Status:", res.statusCode);
console.log("Body:", JSON.stringify(res.body, null, 2));
console.log("Headers:", Object.keys(res.headers));

console.log("\n🧪 Testing POST /api/policies ...");
const res2 = await request(app)
  .post("/api/policies")
  .send({ name: "test", limit: 100, window: "1m" });
console.log("Status:", res2.statusCode);
console.log("Body:", JSON.stringify(res2.body, null, 2));
