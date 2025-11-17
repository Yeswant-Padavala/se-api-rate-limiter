import time
from collections import deque

class PerfMetrics:
    """
    Tracks latency for rate limit checks.
    Computes P95 and P99 from sliding window.
    """

    def __init__(self, window_size=5000):
        self.latencies = deque(maxlen=window_size)

    def record(self, duration_ms: float):
        self.latencies.append(duration_ms)

    def percentile(self, p):
        if not self.latencies:
            return 0
        arr = sorted(self.latencies)
        k = int(len(arr) * p)
        return arr[min(k, len(arr) - 1)]

    @property
    def p95(self):
        return self.percentile(0.95)

    @property
    def p99(self):
        return self.percentile(0.99)
