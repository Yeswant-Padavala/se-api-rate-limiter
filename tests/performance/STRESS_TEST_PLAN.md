# Stress Test Plan — Rate Limiting System

## Objective
To push the system beyond safe operating limits.

## Stress Test Scenarios

### Scenario A — Rapid Scale-Up
- Start with 50 users
- Increase to 2000 users in 5 minutes

### Scenario B — Max Connection Flood
- 3000 users
- 10 requests per second each

### Scenario C — Redis Failure Simulation
- Bring Redis down for 30s
- Observe system behavior
- Validate graceful degradation

## Expected Outcomes
- No system crashes
- Fail-open mode works if configured
- Latency increases but system responds
- Recovery should take < 5 seconds after Redis is restored
