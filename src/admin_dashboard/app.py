from fastapi import FastAPI, HTTPException
from typing import List
from .policies_db import Policy, POLICIES

app = FastAPI(title="Admin Policy Dashboard")

# CREATE policy
@app.post("/policies")
def create_policy(policy: Policy):
    if policy.name in POLICIES:
        raise HTTPException(status_code=400, detail="Policy already exists")
    POLICIES[policy.name] = policy
    return {"message": "Policy created", "policy": policy}

# READ all policies
@app.get("/policies", response_model=List[Policy])
def list_policies():
    return list(POLICIES.values())

# READ single policy
@app.get("/policies/{name}")
def get_policy(name: str):
    if name not in POLICIES:
        raise HTTPException(status_code=404, detail="Policy not found")
    return POLICIES[name]

# UPDATE policy
@app.put("/policies/{name}")
def update_policy(name: str, policy: Policy):
    if name not in POLICIES:
        raise HTTPException(status_code=404, detail="Policy not found")
    POLICIES[name] = policy
    return {"message": "Policy updated", "policy": policy}

# DELETE policy
@app.delete("/policies/{name}")
def delete_policy(name: str):
    if name not in POLICIES:
        raise HTTPException(status_code=404, detail="Policy not found")
    del POLICIES[name]
    return {"message": "Policy deleted"}
