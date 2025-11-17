# Load Test Plan — Rate Limiting System

## Objective
To determine system performance under expected traffic levels.

## Scenarios

### Scenario 1 — Normal Traffic
- 100 users
- 1 request per second each
- Duration: 10 minutes

### Scenario 2 — Heavy Traffic
- 500 users
- 2 requests per second each
- Duration: 15 minutes

### Scenario 3 — Extreme Traffic
- 1000 users
- 5 requests per second each
- Duration: 10 minutes

## Success Criteria
- P95 latency < 10ms
- P99 latency < 20ms
- Error rate < 1%
- No service crashes
