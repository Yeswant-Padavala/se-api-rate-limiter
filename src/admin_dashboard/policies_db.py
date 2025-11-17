from pydantic import BaseModel, Field
from typing import Dict


class Policy(BaseModel):
    name: str = Field(..., min_length=3)
    user_tier: str = Field(..., regex="^(free|paid|premium)$")
    requests_per_minute: int = Field(..., gt=0)
    burst_capacity: int = Field(..., ge=0)


# In-memory database (updated in real-time)
POLICIES: Dict[str, Policy] = {}
