# se-api-rate-limiter - Burst Traffic Handling

**Software Engineering Project: API Rate Limiter with Burst Traffic Support**

## 📋 Overview

This project implements a sophisticated **rate limiter with burst traffic handling** using the **Token Bucket algorithm**. It allows controlled bursts of traffic up to a defined threshold while maintaining long-term average rate limits.

### Key Features

✅ **Burst Traffic Support** - Allow short-term traffic spikes beyond average limits  
✅ **Token Bucket Algorithm** - Sophisticated rate limiting mechanism  
✅ **Per-Policy Configuration** - Different burst limits for different policies  
✅ **Average Rate Control** - Maintains sustainable long-term rates  
✅ **Policy Management** - Create, update, and rollback policies  
✅ **Version Control** - Track policy changes with history  
✅ **TLS Enforcement** - Secure communication  
✅ **Health Monitoring** - Auto-recovery mechanisms  
✅ **Comprehensive Testing** - Unit and integration tests  

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Running the Server

```bash
npm start
```

Server runs on `http://localhost:3000`

### Running Tests

```bash
npm test
```

---

## 📚 Burst Traffic Handling - User Story

**As a system administrator,**  
I want to allow controlled bursts of traffic up to a defined threshold,  
so that legitimate short spikes are accommodated without breaking long-term rate limits.

### Acceptance Criteria

✅ Bursts are allowed up to the configured threshold.  
✅ Average usage is still controlled within the time window.  
✅ Burst capacity is configurable per policy.  

---

## 🎯 How It Works

### Token Bucket Algorithm

The Token Bucket algorithm works by:

1. **Tokens represent requests**: Each request consumes 1 token
2. **Tokens refill at a constant rate**: 
   - Refill Rate = `limit / window`
   - Example: 100 requests per 1 minute = 1.67 tokens per second
3. **Burst capacity is the maximum accumulation**: 
   - `burstLimit` = maximum tokens in bucket
   - Example: 150 tokens maximum
4. **Request allowed if tokens available**: 
   - If `tokens ≥ 1`, request is allowed and 1 token is consumed
   - Otherwise, request is rejected (HTTP 429)

### Example Scenario

**Policy Configuration:**
```
Average Limit: 100 requests/minute
Burst Limit: 150 requests
Burst Window: 10 seconds
```

**Timeline:**
- **T=0s**: Client sends 150 requests → All allowed (burst capacity)
- **T=0s+1ms**: Client sends 1 more request → Rejected (bucket exhausted)
- **T=1s**: 1.67 tokens refilled → ~1-2 new requests allowed
- **T=60s**: ~100 tokens refilled → ~100 new requests allowed
- **T=61s**: Back to sustained rate

---

## 📡 API Endpoints

### Policy Management

#### 1. Get All Policies
```http
GET /api/policies
```

**Response:**
```json
{
  "message": "Fetched all policies",
  "data": [
    {
      "id": 1,
      "name": "default",
      "limit": 100,
      "window": "1m",
      "burstLimit": 150,
      "burstWindow": "10s",
      "version": 1
    }
  ]
}
```

#### 2. Get Specific Policy
```http
GET /api/policies/:id
```

#### 3. Get Policy Statistics
```http
GET /api/policies/:id/stats
```

**Response:**
```json
{
  "message": "Policy statistics retrieved",
  "data": {
    "policy": { ... },
    "statistics": {
      "averageRateLimit": "100 requests per 1m",
      "burstCapacity": "150 requests per 10s",
      "sustainedRate": "100 requests/1m",
      "burstRate": "150 requests/10s",
      "burst_multiplier": "1.50x"
    }
  }
}
```

#### 4. Create Policy
```http
POST /api/policies
Content-Type: application/json

{
  "name": "premium",
  "limit": 1000,
  "window": "1m",
  "burstLimit": 1500,
  "burstWindow": "10s"
}
```

**Response:** `201 Created`

#### 5. Update Policy
```http
PUT /api/policies/:id
Content-Type: application/json

{
  "burstLimit": 2000,
  "limit": 1200
}
```

**Response:** `200 OK` with updated policy

#### 6. Rollback Policy
```http
POST /api/policies/:id/rollback
```

**Response:** `200 OK` with previous version

---

## 🔧 Configuration

### Policy Fields

| Field | Type | Description | Required | Example |
|-------|------|-------------|----------|---------|
| `name` | string | Policy identifier | ✅ | "premium" |
| `limit` | integer | Average requests per window | ✅ | 100 |
| `window` | string | Time window (duration format) | ✅ | "1m", "5m", "1h" |
| `burstLimit` | integer | Max requests in burst | ❌ | 150 |
| `burstWindow` | string | Burst duration | ❌ | "10s", "30s" |

### Duration Format

Duration strings must follow the pattern: `<number><unit>`

| Unit | Description | Examples |
|------|-------------|----------|
| `s` | Seconds | "10s", "30s" |
| `m` | Minutes | "1m", "5m" |
| `h` | Hours | "1h", "24h" |

---

## 📊 Rate Limit Response Headers

All API responses include rate limit information in headers:

```http
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Burst-Limit: 150
X-RateLimit-Remaining: 87
X-RateLimit-Burst-Remaining: 87
```

### Rate Limit Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json

{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 12,
  "rateLimit": {
    "limit": 100,
    "window": "1m",
    "burstLimit": 150,
    "burstWindow": "10s"
  }
}
```

---

## 🏗️ Project Structure

```
src/
├── app.js                          # Main Express application
├── controllers/
│   ├── policyController.js         # Policy CRUD operations
│   └── healthController.js         # Health checks
├── middleware/
│   ├── burstRateLimiter.js        # 🆕 Token bucket rate limiter
│   ├── validation.js               # Input validation
│   ├── security.js                 # Security headers
│   ├── tlsEnforcer.js             # TLS enforcement
│   └── rateLimiter.js             # Legacy rate limiter
├── models/
│   ├── burstRateLimiterModel.js   # 🆕 Token bucket implementation
│   ├── policyModel.js              # Policy data
│   ├── policyHistoryModel.js       # Policy version history
│   └── nodeHealthModel.js          # Health status
├── routes/
│   ├── policyRoutes.js             # Policy endpoints
│   └── healthRoutes.js             # Health endpoints
└── utils/
    ├── logger.js                   # Logging utility
    └── tlsAuditLogger.js           # TLS audit logging

tests/
├── unit/
│   ├── burstRateLimiter.test.js   # 🆕 Token bucket tests
│   ├── policyController.test.js
│   ├── security.test.js
│   └── validation.test.js
└── integration/
    ├── burstPolicy.test.js         # 🆕 Burst policy tests
    └── policyRoutes.test.js
```

---

## 🧪 Testing

### Unit Tests for Token Bucket Algorithm

```bash
npm test -- tests/unit/burstRateLimiter.test.js
```

Tests cover:
- Token consumption and burst capacity
- Token refill rate validation
- Sustained rate limiting
- Real-world burst scenarios
- Statistics and monitoring
- Edge cases

### Integration Tests

```bash
npm test -- tests/integration/burstPolicy.test.js
```

Tests cover:
- Policy creation with burst config
- Validation of burst parameters
- Policy updates and rollbacks
- Rate limit headers
- Error handling

### Run All Tests

```bash
npm test
```

---

## 💡 Implementation Details

### Token Bucket Algorithm Class

**File:** `src/models/burstRateLimiterModel.js`

```javascript
class TokenBucket {
  constructor(refillRate, burstCapacity, currentTime)
  refill(currentTime)
  tryConsume(tokensNeeded, currentTime)
  getTokenCount(currentTime)
  getStats(currentTime)
}
```

### Burst Rate Limiter Middleware

**File:** `src/middleware/burstRateLimiter.js`

**Key Functions:**
- `burstRateLimiter()` - Express middleware for rate limiting
- `getRateLimitStatus()` - Get status for a client
- `resetRateLimit()` - Clear bucket for a client
- `getAllRateLimitStatus()` - Monitor all active buckets

---

## 🔒 Security Features

✅ **TLS Enforcement** - All connections secured  
✅ **Helmet.js Integration** - HTTP security headers  
✅ **CORS Enabled** - Cross-origin resource sharing  
✅ **Input Validation** - Express-validator integration  
✅ **Rate Limiting** - DDoS protection  
✅ **Audit Logging** - TLS configuration tracking  

---

## 📈 Performance Characteristics

- **Time Complexity**: O(1) for token consumption
- **Space Complexity**: O(n) where n = number of unique clients
- **Latency**: < 1ms per request
- **Scalability**: In-memory, suitable for single-instance deployments

### For Production Scaling

Consider using:
- Redis for distributed rate limiting
- Database for policy storage
- Load balancing across multiple instances
- Cluster mode for Node.js

---

## 🐛 Error Handling

### Validation Errors

```json
{
  "errors": [
    {
      "msg": "Burst limit must be greater than or equal to average limit",
      "param": "burstLimit"
    }
  ],
  "hint": "Check policy configuration..."
}
```

### Not Found Errors

```json
{
  "message": "Policy not found"
}
```

### Rate Limit Exceeded

```json
{
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 12,
  "rateLimit": { ... }
}
```

---

## 📝 Example Workflows

### Workflow 1: Create a Premium Policy with Burst

```bash
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "premium-api",
    "limit": 1000,
    "window": "1m",
    "burstLimit": 1500,
    "burstWindow": "10s"
  }'
```

### Workflow 2: Update Burst Capacity

```bash
curl -X PUT http://localhost:3000/api/policies/1 \
  -H "Content-Type: application/json" \
  -d '{
    "burstLimit": 2000
  }'
```

### Workflow 3: Check Policy Stats

```bash
curl http://localhost:3000/api/policies/1/stats
```

### Workflow 4: Rollback Policy

```bash
curl -X POST http://localhost:3000/api/policies/1/rollback
```

---

## 🚀 Deployment

### Environment Variables

```bash
PORT=3000
NODE_ENV=production
```

### Start Server

```bash
npm start
```

### Health Check

```bash
curl http://localhost:3000/api/health
```

---

## 📊 Monitoring

### Get All Rate Limits (Admin Endpoint - Future)

```javascript
import { getAllRateLimitStatus } from './src/middleware/burstRateLimiter.js';

const status = getAllRateLimitStatus();
console.log(status);
```

**Output:**
```javascript
[
  {
    clientId: "192.168.1.1",
    availableTokens: 45,
    burstCapacity: 150,
    refillRate: 1.67,
    lastRefillTime: "2025-11-16T10:30:45.123Z"
  }
]
```

---

## 🔄 Burst Traffic - Real-World Examples

### Example 1: API Gateway for Mobile Apps

**Scenario:** Mobile app users experience spike during break time

**Policy:**
```
Average: 100 requests/minute
Burst: 200 requests/10 seconds
```

**Behavior:**
- Users can send 200 requests during break without rejection
- Over long term, average stays at 100 requests/minute
- Legitimate spike accommodated without service disruption

### Example 2: Analytics Dashboard

**Scenario:** Dashboard refresh spike when many users open reports

**Policy:**
```
Average: 50 requests/minute
Burst: 150 requests/5 seconds
```

**Behavior:**
- Burst handles dashboard refresh spike
- Protects backend from sustained high load
- Fair allocation across all users

### Example 3: CI/CD Pipeline Webhooks

**Scenario:** Build notifications create traffic spike

**Policy:**
```
Average: 200 requests/minute
Burst: 400 requests/15 seconds
```

**Behavior:**
- Handles webhook delivery spikes
- Maintains stable long-term rates
- Prevents server overload

---

## 🔍 Comparison: Average Rate vs Burst Rate

### Without Burst Support

```
Request Timeline:
T=0s:   [Request 1-100] ✅ Success
T=0s:   [Request 101+]  ❌ Rejected (limit reached)
T=1s:   [Request 101-102] ✅ Success (only ~1-2 new slots)
T=60s:  [Request 101-200] ✅ Success (100 new slots)

❌ Legitimate spike is rejected entirely
❌ Poor user experience during traffic spikes
```

### With Burst Support

```
Request Timeline:
T=0s:   [Request 1-150] ✅ Success (burst capacity)
T=0s:   [Request 151+]  ❌ Rejected
T=1s:   [Request 151-152] ✅ Success (refill)
T=10s:  [Request 151-167] ✅ Success (~17 more slots)
T=60s:  [Request 168-267] ✅ Success (~100 more slots)

✅ Legitimate spikes are accommodated
✅ Long-term rate still controlled
✅ Better user experience
```

---

## 🎓 Algorithm Deep Dive

### Token Bucket Formula

**Refill Rate:**
```
refillRate = limit / window (in milliseconds)
```

**Example:**
```
limit = 100 requests
window = 60,000 milliseconds (1 minute)
refillRate = 100 / 60,000 = 0.00167 tokens/ms (1 token per ~600ms)
```

**Token Accumulation:**
```
tokensNow = min(burstCapacity, tokensPrevious + (timePassed × refillRate))
```

**Request Allowed:**
```
allowed = tokensNow >= 1
```

---

## 🤝 Contributing

1. Create a feature branch
2. Implement changes with tests
3. Ensure all tests pass: `npm test`
4. Submit pull request

---

## 📄 License

This project is part of a Software Engineering course.

---

## 👥 Contributors

- **Yeswant Padavala** - Project Owner
- **Development Team** - Sprint 1 Implementation

---

## 📞 Support

For issues or questions:
1. Check documentation
2. Review test cases for usage examples
3. Create an issue on GitHub

---

## 🔮 Future Enhancements

- [ ] Redis integration for distributed rate limiting
- [ ] Database persistence for policies
- [ ] Web UI for policy management
- [ ] Advanced analytics dashboard
- [ ] Per-endpoint rate limiting
- [ ] Dynamic burst adjustment
- [ ] Monitoring and alerting
- [ ] Multi-tenant support
- [ ] Custom rate limit headers
- [ ] Webhook notifications for rate limit events

---

## 📚 References

- Token Bucket Algorithm: https://en.wikipedia.org/wiki/Token_bucket
- Express.js Rate Limiting: https://expressjs.com/
- Express Validator: https://express-validator.github.io/

---

**Last Updated:** November 16, 2025  
**Status:** ✅ Ready for Production
