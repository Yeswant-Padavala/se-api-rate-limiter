// Stores previous versions of policies (simple in-memory storage)
export let policyHistory = [];

// Save old version before update
export const savePolicyVersion = (policy) => {
  policyHistory.push({
    ...policy,
    version: Date.now(),   // unique version timestamp
    savedAt: new Date().toISOString(),
  });
};

// Get all versions of a policy by ID
export const getPolicyVersions = (policyId) => {
  return policyHistory.filter(v => v.id === policyId);
};

// Rollback function
export const rollbackPolicyVersion = (policyId, versionTimestamp) => {
  const version = policyHistory.find(
    v => v.id === policyId && v.version === versionTimestamp
  );

  return version || null;
};
