import { getPolicies, createPolicy } from "../../src/controllers/policyController.js";
import { policies } from "../../src/models/policyModel.js";

describe("Policy Controller Unit Tests", () => {
  test("getPolicies returns all policies", () => {
    const req = {};
    const res = { json: jest.fn() };

    getPolicies(req, res);
    expect(res.json).toHaveBeenCalledWith({
      message: "Fetched all policies",
      data: policies
    });
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
