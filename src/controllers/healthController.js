import { nodes } from "../models/nodehealthModel.js";

// HEALTH CHECK ENDPOINT
export const systemHealthCheck = (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date(),
    nodes: nodes
  });
};

// AUTO-RECOVERY (simulated)
export const autoRecovery = () => {
  nodes.forEach((node) => {
    const random = Math.random();

    if (random < 0.1) {
      node.status = "unhealthy";
    } else {
      node.status = "healthy";
    }

    node.lastCheck = Date.now();
  });
};

// GET ONLY HEALTHY NODES (for load balancer)
export const getHealthyNodes = (req, res) => {
  const healthy = nodes.filter((n) => n.status === "healthy");
  res.json({ healthyNodes: healthy });
};
