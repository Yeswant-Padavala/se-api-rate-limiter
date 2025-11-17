let nodeList = [
    { id: "node-1", status: "healthy", lastChecked: Date.now() },
    { id: "node-2", status: "healthy", lastChecked: Date.now() },
    { id: "node-3", status: "unhealthy", lastChecked: Date.now() }
  ];
  
  export const nodes = nodeList;
  
  export const removeUnhealthyNodes = () => {
    nodeList = nodeList.filter(node => node.status === "healthy");
    return nodeList;
  };
  