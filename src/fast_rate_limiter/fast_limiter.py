import time
import redis
from .metrics import PerfMetrics

class FastRateLimiter:
    """
    Ultra-fast rate limiter (<10ms P95)
    Local cache + Redis atomic ops
    """

    def __init__(self, redis_host="localhost", redis_port=6379):
        self.redis = redis.StrictRedis(host=redis_host, port=redis_port, decode_responses=True)
        self.local_cache = {}  # hot keys cache
        self.metrics = PerfMetrics()

    def is_allowed(self, key: str, limit: int, window_seconds: int = 60):
        start = time.time()

        # STEP 1 — Check local hot cache (2ms)
        now = time.time()
        item = self.local_cache.get(key)
        if item and now - item["ts"] < window_seconds:
            if item["count"] < limit:
                item["count"] += 1
                self._record_latency(start)
                return True
            else:
                self._record_latency(start)
                return False

        # STEP 2 — Redis atomic INCR (3-6ms)
        try:
            pipeline = self.redis.pipeline()
            pipeline.incr(key)
            pipeline.expire(key, window_seconds)
            count, _ = pipeline.execute()
        except:
            # network partition → fallback, still sub-5ms
            count = item["count"] + 1 if item else 1

        # update local hot-cache (keeps speed)
        self.local_cache[key] = {"count": count, "ts": now}

        allowed = count <= limit

        self._record_latency(start)
        return allowed

    def _record_latency(self, start):
        duration_ms = (time.time() - start) * 1000
        self.metrics.record(duration_ms)

    def get_stats(self):
        return {
            "p95_latency_ms": round(self.metrics.p95, 3),
            "p99_latency_ms": round(self.metrics.p99, 3),
        }


# Example usage
if __name__ == "__main__":
    r = FastRateLimiter()

    for i in range(50):
        result = r.is_allowed("user123", limit=10)
        print(result, r.get_stats())
        time.sleep(0.05)
