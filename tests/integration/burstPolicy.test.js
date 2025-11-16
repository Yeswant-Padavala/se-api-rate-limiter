/**
 * Integration Tests for Burst Rate Limiter with Policy Management
 * 
 * Tests the complete flow:
 * - Creating policies with burst configuration
 * - Rate limiting enforcement
 * - Policy updates
 * - Burst capacity validation
 */

// Set test environment before importing app
process.env.NODE_ENV = "test";

import request from "supertest";
import app, { cleanup } from "../../src/app.js";
import { policies } from "../../src/models/policyModel.js";

describe("Burst Rate Limiter Integration Tests", () => {
  // Cleanup after all tests
  afterAll(() => {
    cleanup();
  });
  /**
   * Test 1: Policy Management with Burst Configuration
   */
  describe("Policy Creation and Management", () => {
    it("should create policy with burst configuration", async () => {
      const policyData = {
        name: "test-burst",
        limit: 100,
        window: "1m",
        burstLimit: 150,
        burstWindow: "10s",
      };

      const response = await request(app)
        .post("/api/policies")
        .send(policyData)
        .expect(201);

      expect(response.body.data).toHaveProperty("burstLimit", 150);
      expect(response.body.data).toHaveProperty("burstWindow", "10s");
      expect(response.body.message).toContain("burst");
    });

    it("should default burstLimit to limit if not provided", async () => {
      const policyData = {
        name: "default-burst",
        limit: 100,
        window: "1m",
      };

      const response = await request(app)
        .post("/api/policies")
        .send(policyData)
        .expect(201);

      expect(response.body.data.burstLimit).toBe(100);
    });

    it("should retrieve all policies with burst info", async () => {
      const response = await request(app)
        .get("/api/policies")
        .expect(200);

      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty("burstLimit");
      expect(response.body.data[0]).toHaveProperty("burstWindow");
    });

    it("should get specific policy by ID", async () => {
      const response = await request(app)
        .get("/api/policies/1")
        .expect(200);

      expect(response.body.data.id).toBe(1);
      expect(response.body.data).toHaveProperty("burstLimit");
    });

    it("should get policy statistics", async () => {
      const response = await request(app)
        .get("/api/policies/1/stats")
        .expect(200);

      expect(response.body.data.statistics).toHaveProperty("burstCapacity");
      expect(response.body.data.statistics).toHaveProperty("burst_multiplier");
    });
  });

  /**
   * Test 2: Validation Tests
   */
  describe("Validation", () => {
    it("should reject burst limit less than average limit", async () => {
      const policyData = {
        name: "invalid-burst",
        limit: 100,
        window: "1m",
        burstLimit: 50, // Less than limit
        burstWindow: "10s",
      };

      const response = await request(app)
        .post("/api/policies")
        .send(policyData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it("should reject invalid duration format", async () => {
      const policyData = {
        name: "invalid-duration",
        limit: 100,
        window: "1x", // Invalid
        burstLimit: 150,
        burstWindow: "10s",
      };

      const response = await request(app)
        .post("/api/policies")
        .send(policyData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it("should accept valid duration formats", async () => {
      const validFormats = ["1s", "10m", "5h", "2m"];

      for (const format of validFormats) {
        const policyData = {
          name: `test-${format}`,
          limit: 100,
          window: format,
          burstLimit: 150,
          burstWindow: format,
        };

        const response = await request(app)
          .post("/api/policies")
          .send(policyData);

        // Should either succeed or fail for other reasons, not format
        expect(response.status).not.toBe(400);
      }
    });

    it("should validate required fields", async () => {
      const invalidData = {
        limit: 100,
        // Missing name and window
      };

      const response = await request(app)
        .post("/api/policies")
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  /**
   * Test 3: Policy Update with Burst Changes
   */
  describe("Policy Updates", () => {
    it("should update policy including burst parameters", async () => {
      const updateData = {
        name: "updated-policy",
        limit: 200,
        window: "2m",
        burstLimit: 300,
        burstWindow: "15s",
      };

      const response = await request(app)
        .put("/api/policies/1")
        .send(updateData)
        .expect(200);

      expect(response.body.data.limit).toBe(200);
      expect(response.body.data.burstLimit).toBe(300);
      expect(response.body.message).toContain("burst");
    });

    it("should partially update policy", async () => {
      const updateData = {
        burstLimit: 250,
      };

      const response = await request(app)
        .put("/api/policies/2")
        .send(updateData)
        .expect(200);

      expect(response.body.data.burstLimit).toBe(250);
    });

    it("should increment version on update", async () => {
      const updateData = {
        burstLimit: 500,
      };

      const response = await request(app)
        .put("/api/policies/1")
        .send(updateData)
        .expect(200);

      expect(response.body.data.version).toBeGreaterThan(1);
    });
  });

  /**
   * Test 4: Rate Limit Headers
   */
  describe("Rate Limit Response Headers", () => {
    it("should include rate limit headers in response", async () => {
      const response = await request(app)
        .get("/api/policies")
        .expect(200);

      // Check for rate limit headers
      expect(response.headers["x-ratelimit-limit"]).toBeDefined();
      expect(response.headers["x-ratelimit-burst-limit"]).toBeDefined();
      expect(response.headers["x-ratelimit-remaining"]).toBeDefined();
    });
  });

  /**
   * Test 5: Error Handling
   */
  describe("Error Handling", () => {
    it("should handle non-existent policy", async () => {
      const response = await request(app)
        .get("/api/policies/99999")
        .expect(404);

      expect(response.body.message).toContain("not found");
    });

    it("should handle invalid policy ID on update", async () => {
      const updateData = {
        limit: 200,
      };

      const response = await request(app)
        .put("/api/policies/99999")
        .send(updateData)
        .expect(404);

      expect(response.body.message).toContain("not found");
    });

    it("should handle rollback", async () => {
      // Update policy first
      const updateData = {
        limit: 500,
        burstLimit: 750,
      };

      await request(app)
        .put("/api/policies/1")
        .send(updateData)
        .expect(200);

      // Rollback
      const rollbackResponse = await request(app)
        .post("/api/policies/1/rollback")
        .expect(200);

      expect(rollbackResponse.body.message).toContain("Rollback successful");
      expect(rollbackResponse.body.data).toHaveProperty("burstLimit");
    });
  });

  /**
   * Test 6: Health Check Endpoint
   */
  describe("API Endpoints", () => {
    it("should respond with health check", async () => {
      const response = await request(app)
        .get("/api/health")
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it("should respond to root endpoint", async () => {
      const response = await request(app)
        .get("/")
        .expect(200);

      expect(response.body.message).toContain("Rate Limiter");
    });
  });
});
