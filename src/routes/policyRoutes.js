import {
    updatePolicyController,
    getPolicyHistory,
    rollbackPolicy
  } from "../controllers/policyController.js";
  
  // PUT — Update policy
  router.put("/:id", updatePolicyController);
  
  // GET — See all versions
  router.get("/:id/history", getPolicyHistory);
  
  // POST — Rollback
  router.post("/:id/rollback/:version", rollbackPolicy);
  