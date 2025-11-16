import { policies } from "../models/policyModel.js";
import { policyHistory } from "../models/policyHistoryModel.js";

// GET all policies
export const getPolicies = (req, res) => {
  res.json({ message: "Fetched all policies", data: policies });
};

// CREATE new policy
export const createPolicy = (req, res) => {
  const { name, limit, window } = req.body;

  const newPolicy = {
    id: policies.length + 1,
    name,
    limit,
    window,
    version: 1
  };

  policies.push(newPolicy);

  res.status(201).json({
    message: "Policy created successfully",
    data: newPolicy,
  });
};

// UPDATE POLICY + SAVE OLD VERSION
export const updatePolicy = (req, res) => {
  const { id } = req.params;
  const { name, limit, window } = req.body;

  const policy = policies.find((p) => p.id == id);
  if (!policy) return res.status(404).json({ message: "Policy not found" });

  // Save old version
  policyHistory.push({ ...policy });

  // Update to new version
  policy.name = name;
  policy.limit = limit;
  policy.window = window;
  policy.version += 1;

  res.json({
    message: "Policy updated & version recorded",
    data: policy,
  });
};

// ROLLBACK POLICY
export const rollbackPolicy = (req, res) => {
  const { id } = req.params;

  const previousVersions = policyHistory.filter((p) => p.id == id);

  if (previousVersions.length === 0) {
    return res.status(404).json({ message: "No previous versions found" });
  }

  const lastVersion = previousVersions.pop();

  // Replace current policy with last version
  const index = policies.findIndex((p) => p.id == id);
  policies[index] = lastVersion;

  res.json({
    message: "Rollback successful",
    data: lastVersion,
  });
};
