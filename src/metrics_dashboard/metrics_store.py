import time
from typing import Dict, List
from pydantic import BaseModel


class Metric(BaseModel):
    timestamp: float
    user_id: str
    tier: str
    ip: str
    token: str
    request_count: int
    limit: int


# In-memory storage
METRICS: List[Metric] = []


def record_request(user_id, tier, ip, token, limit):
    METRICS.append(Metric(
        timestamp=time.time(),
        user_id=user_id,
        tier=tier,
        ip=ip,
        token=token,
        request_count=1,
        limit=limit
    ))


def get_metrics(time_range_sec: int = 60, tier_filter: str = None):
    now = time.time()
    filtered = [
        m for m in METRICS
        if (now - m.timestamp) <= time_range_sec
        and (tier_filter is None or m.tier == tier_filter)
    ]
    return filtered
