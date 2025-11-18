import { createPolicy, getPolicies } from "../../../src/controllers/policyController.js";
import { jest } from "@jest/globals";

test("creates new policy", async () => {
  const req = { body: { name: "test", limit: 100, window: "1m" }};
  const res = { json: jest.fn() };

  await createPolicy(req, res);

  expect(res.json).toHaveBeenCalled();
});
