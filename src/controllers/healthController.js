import { nodes, removeUnhealthyNodes } from "../models/nodeHealthModel.js";

// GET /api/health/status
export const getHealthStatus = (req, res) => {
  res.json({
    message: "Cluster health status",
    nodes,
  });
};

// Auto-recovery logic (simulated)
export const autoRecovery = () => {
  console.log("Running auto-recovery...");

  // Remove unhealthy nodes
  const healthyNodes = removeUnhealthyNodes();

  console.log("Healthy nodes:", healthyNodes);
};
