from fastapi import FastAPI, Header, HTTPException
from .auth import authenticate, verify_token
from .rbac import require_role
import logging

logging.basicConfig(filename="admin_audit.log", level=logging.INFO)

app = FastAPI(title="Admin RBAC System")

# LOGIN ENDPOINT
@app.post("/login")
def login(username: str, password: str):
    token = authenticate(username, password)
    logging.info(f"LOGIN SUCCESS: user={username}")
    return {"token": token}

# PROTECTED ACTION – superadmin & operator can access
@app.get("/admin/view-settings")
def view_settings(Authorization: str = Header(None)):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Token required")

    token_data = verify_token(Authorization)
    require_role(token_data, ["superadmin", "operator"])

    logging.info(f"VIEW SETTINGS by user={token_data['sub']}")
    return {"message": "Here are the admin settings"}

# SUPERADMIN ONLY ACTION
@app.post("/admin/update-settings")
def update_settings(new_value: str, Authorization: str = Header(None)):
    if not Authorization:
        raise HTTPException(status_code=401, detail="Token required")

    token_data = verify_token(Authorization)
    require_role(token_data, ["superadmin"])

    logging.info(f"UPDATE SETTINGS by user={token_data['sub']}")
    return {"message": f"Settings updated to {new_value}"}
