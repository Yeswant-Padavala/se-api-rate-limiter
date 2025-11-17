# Administrator & Operations Guide  
Version 1.0  
Project: Rate Limiting System  

---

# 1. Introduction  
This guide helps system administrators install, configure, run, and troubleshoot the Rate Limiting System in production.

It explains:  
- How to install the system  
- How to configure every component  
- How to operate it in a cluster  
- How to debug issues  
- Best practices for production  

---

# 2. System Architecture Overview  
The system includes:  
- **Fast Rate Limiter** (sub-10ms checks)  
- **Redis Distributed Counters**  
- **Policy Admin Dashboard**  
- **RBAC Authentication System**  
- **Metrics Dashboard**  
- **Graceful Degradation Module**  

Everything works together to provide consistent and high-performance rate limiting in distributed deployments.

---

# 3. Installation Guide  

## 3.1 Requirements  
- Python 3.10+  
- Redis 6+  
- FastAPI  
- Uvicorn  
- Git  
- Linux or Windows  

## 3.2 Install Python Dependencies  

```bash
pip install fastapi uvicorn redis bcrypt python-jose
```

## 3.3 Start Redis  
Local:
```bash
redis-server
```

Remote (cloud Redis example):
- Enter Host  
- Enter Port  
- Enter Password (optional)

## 3.4 Run Components  

### Run Admin Dashboard
```bash
uvicorn src.admin_dashboard.app:app --reload
```

### Run RBAC Authentication Service
```bash
uvicorn src.admin_rbac.app:app --reload
```

### Run Metrics Dashboard
```bash
uvicorn src.metrics_dashboard.app:app --reload
```

### Run Fast Rate Limiter
```bash
python src/fast_rate_limiter/fast_limiter.py
```

---

# 4. Configuration Reference  

## 4.1 Environment Variables  
| Variable | Description | Example |
|---------|-------------|---------|
| `REDIS_HOST` | Redis IP/Hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `RL_LIMIT` | Requests allowed per user | `100` |
| `RL_WINDOW` | Rate limit window in seconds | `60` |
| `RL_MODE` | "fail-open" or "fail-closed" | `fail-open` |

## 4.2 Policy Configuration  
Policies are configured through the admin UI (CRUD):  
- User Tier: free / paid / premium  
- Requests per minute  
- Burst capacity  
- Rules update in real-time (no restart required)

## 4.3 RBAC Configuration  
Roles supported:  
- **superadmin** → full access  
- **operator** → limited control  

RBAC uses **JWT tokens** and logs all admin actions.

---

# 5. Troubleshooting Guide  

## 5.1 Redis Not Connecting  
**Error:** `redis.exceptions.ConnectionError`  
**Fix:**  
- Check Redis is running:  
  ```bash
  redis-cli ping
  ```  
- Check firewall  
- Verify host/port  

---

## 5.2 High Latency (>10ms)  
Possible causes:  
- Redis slow  
- Local cache disabled  
- Too many active connections  

Fix:  
- Enable Redis pipelining (already included)  
- Increase local hot cache size  
- Scale Redis vertically  

---

## 5.3 Rate Limit Not Updating  
Fix:  
- Ensure dashboard PUT endpoint is used  
- Clear Redis key:  
  ```bash
  redis-cli DEL user123
  ```

---

## 5.4 Admin Login Not Working  
Fix:  
- Use correct credentials  
- Check JWT expiration  
- Ensure system time is correct  

---

# 6. Best Practices for Production  

### ✔ Use Redis Cluster  
Ensures high availability and low latency.

### ✔ Use Fail-Open Mode for Critical Traffic  
System continues even if Redis is down.

### ✔ Enable Logging  
Store:  
- Degradation events  
- Admin audit logs  
- Metrics logs

### ✔ Use Separate Redis DBs  
- One for counters  
- One for policies  

### ✔ Use API Gateway Caching  
Reduces repeated requests on rate limiter.

### ✔ Monitor Latency  
Track P95 & P99 metrics in real-time.

---

# 7. Summary  
This guide provides everything needed for:  
- Installing  
- Configuring  
- Operating  
- Monitoring  
- Troubleshooting  

The Rate Limiting System is now production-ready.

---

# End of Guide
