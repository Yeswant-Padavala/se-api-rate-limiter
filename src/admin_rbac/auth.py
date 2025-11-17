from fastapi import HTTPException
from jose import jwt
import bcrypt
import time

SECRET_KEY = "SUPER_SECRET_KEY"   # use env var in real system
ALGORITHM = "HS256"

# Fake user database
USERS = {
    "superadmin": {
        "password": bcrypt.hashpw("admin123".encode(), bcrypt.gensalt()),
        "role": "superadmin"
    },
    "operator1": {
        "password": bcrypt.hashpw("op123".encode(), bcrypt.gensalt()),
        "role": "operator"
    }
}

def authenticate(username: str, password: str):
    """Verify username + password."""
    if username not in USERS:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    hashed = USERS[username]["password"]
    if not bcrypt.checkpw(password.encode(), hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create token
    payload = {
        "sub": username,
        "role": USERS[username]["role"],
        "exp": time.time() + 3600  # 1 hour expiry
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token

def verify_token(token: str):
    """Validate the token and return claims."""
    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return decoded
    except:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
