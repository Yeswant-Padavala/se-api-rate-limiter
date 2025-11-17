from locust import HttpUser, task, between

class RateLimiterLoadTest(HttpUser):
    wait_time = between(1, 2)

    @task
    def hit_rate_limit_api(self):
        # Simulate request to your API rate limiter endpoint
        self.client.get("/rate-limit?user=user123")
