from fastapi import HTTPException

def require_role(token_data, allowed_roles):
    """Check if user's role is allowed."""
    user_role = token_data.get("role")
    if user_role not in allowed_roles:
        raise HTTPException(status_code=403, detail="Access denied")
