import { policies, updatePolicy } from "../models/policyModel.js";
import { 
  savePolicyVersion,
  getPolicyVersions,
  rollbackPolicyVersion
} from "../models/policyHistoryModel.js";

// UPDATE POLICY (with versioning)
export const updatePolicyController = (req, res) => {
  const id = parseInt(req.params.id);
  const existingPolicy = policies.find(p => p.id === id);

  if (!existingPolicy) {
    return res.status(404).json({ error: "Policy not found" });
  }

  // Save old version before update
  savePolicyVersion(existingPolicy);

  const updated = updatePolicy(id, req.body);

  res.json({
    message: "Policy updated successfully",
    updatedPolicy: updated
  });
};

// GET ALL VERSIONS OF A POLICY
export const getPolicyHistory = (req, res) => {
  const id = parseInt(req.params.id);
  const versions = getPolicyVersions(id);

  res.json({
    policyId: id,
    versions
  });
};

// ROLLBACK POLICY
export const rollbackPolicy = (req, res) => {
  const id = parseInt(req.params.id);
  const version = parseInt(req.params.version);

  const versionData = rollbackPolicyVersion(id, version);

  if (!versionData) {
    return res.status(404).json({ error: "Version not found" });
  }

  // Apply rollback
  const index = policies.findIndex(p => p.id === id);
  policies[index] = {
    id: versionData.id,
    name: versionData.name,
    limit: versionData.limit,
    window: versionData.window
  };

  res.json({
    message: "Rollback successful",
    activePolicy: policies[index]
  });
};
