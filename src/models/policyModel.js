// Active policies currently in system
export let policies = [
  { id: 1, name: "default", limit: 100, window: "1m" },
  { id: 2, name: "premium", limit: 1000, window: "1m" }
];

// Update an existing policy
export const updatePolicy = (policyId, newData) => {
  const index = policies.findIndex(p => p.id === policyId);
  if (index === -1) return null;

  // Create updated policy object
  const updated = { ...policies[index], ...newData };

  policies[index] = updated;
  return updated;
};
