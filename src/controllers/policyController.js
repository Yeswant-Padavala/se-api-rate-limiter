import { policies } from "../models/policyModel.js";

// GET /api/policies
export const getPolicies = (req, res) => {
  res.json({
    message: "Fetched all policies",
    data: policies,
  });
};

// POST /api/policies
export const createPolicy = (req, res) => {
  const { name, limit, window } = req.body;
  const newPolicy = { id: policies.length + 1, name, limit, window };

  policies.push(newPolicy);
  res.status(201).json({
    message: "Policy created successfully",
    data: newPolicy,
  });
};
