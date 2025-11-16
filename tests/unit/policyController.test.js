import { jest } from "@jest/globals";

import { getPolicies, createPolicy } from "../../src/controllers/policyController.js";
import { policies } from "../../src/models/policyModel.js";

describe("Policy Controller Unit Tests", () => {
  test("getPolicies returns all policies", () => {
    const req = {};
    const res = { json: jest.fn() };

    getPolicies(req, res);
    
    // Check that res.json was called
    expect(res.json).toHaveBeenCalled();
    
    // Get the actual call arguments
    const callArgs = res.json.mock.calls[0][0];
    
    // Verify the response structure
    expect(callArgs.message).toBe("Fetched all policies");
    expect(callArgs.data).toEqual(policies);
    expect(callArgs.documentation).toBeDefined();
  });

  test("createPolicy adds a new policy", () => {
    const req = { body: { name: "test", limit: 100, window: "1m" } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    createPolicy(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0].data).toMatchObject({
      name: "test",
      limit: 100,
      window: "1m"
    });
  });
});
