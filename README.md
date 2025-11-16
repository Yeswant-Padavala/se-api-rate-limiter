# se-api-rate-limiter 🔄

**Software Engineering Project: API Rate Limiter with Burst Traffic Support**

A production-ready API rate limiter service with advanced burst traffic handling, policy management, and comprehensive security features.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Burst Traffic Handling](#burst-traffic-handling)
- [Policy Management](#policy-management)
- [Testing](#testing)
- [Usage Examples](#usage-examples)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Overview

This project implements a comprehensive API rate limiting system with support for **controlled burst traffic**. It allows legitimate short spikes in traffic while maintaining long-term average rate limits through a token bucket algorithm.

**Key Capability**: Allow bursts of traffic up to a configured threshold while ensuring average usage stays within defined limits over time.

---

## ✨ Features

### Core Features
- ✅ **Burst Traffic Support** - Allow controlled traffic spikes with configurable burst limits
- ✅ **Token Bucket Algorithm** - Efficient rate limiting with burst capacity
- ✅ **Policy Management** - Create, update, and rollback rate limit policies
- ✅ **Per-IP Rate Limiting** - Individual limits per client IP address
- ✅ **Dynamic Policies** - Change limits without server restart

### Advanced Features
- 🔐 **TLS Enforcement** - Secure communication with minimum TLS 1.2
- 🛡️ **Security Headers** - Built-in security with Helmet.js
- 📊 **Health Monitoring** - Auto-recovery and system health tracking
- 📝 **Comprehensive Logging** - Morgan request logging and TLS audit logs
- ✔️ **Input Validation** - Express-validator for request validation
- 🧪 **Full Test Coverage** - Unit and integration tests

---

## 🏗️ Architecture

### Component Structure

```
src/
├── app.js                           # Main Express application
├── middleware/
│   ├── burstRateLimiter.js         # 🆕 Token bucket rate limiter with burst support
│   ├── rateLimiter.js              # Legacy rate limiter
│   ├── security.js                 # Security headers middleware
│   ├── tlsEnforcer.js              # TLS enforcement
│   └── validation.js               # Request validation
├── models/
│   ├── burstRateLimiterModel.js    # 🆕 Token bucket implementation
│   ├── policyModel.js              # Policy definitions with burst config
│   ├── policyHistoryModel.js       # Policy version history
│   └── nodeHealthModel.js          # Health monitoring
├── controllers/
│   ├── policyController.js         # Policy CRUD operations with burst support
│   └── healthController.js         # Health check logic
├── routes/
│   ├── policyRoutes.js             # Policy endpoints with burst management
│   └── healthRoutes.js             # Health check routes
└── utils/
    ├── logger.js                   # Custom logging
    └── tlsAuditLogger.js           # TLS configuration audit
```

### Token Bucket Algorithm

The burst rate limiter uses the **Token Bucket Algorithm**:

```
Tokens flow into bucket at rate = limit / window
Bucket capacity = burst_limit
Each request consumes 1 token
Request allowed if tokens available
```

This allows:
- **Burst Capacity**: Immediate allowance of up to `burstLimit` requests
- **Sustained Rate**: Average rate controlled by `limit` per `window`
- **Fairness**: All clients get same treatment

---

## 📦 Installation

### Prerequisites
- Node.js v22.x or higher
- npm 10.x or higher

### Setup Steps

```bash
# Clone the repository
git clone https://github.com/Yeswant-Padavala/se-api-rate-limiter.git
cd se-api-rate-limiter

# Install dependencies
npm install

# Start the server
npm start

# Or start with nodemon for development
npm run dev

# Run tests
npm test
```

---

## ⚙️ Configuration

### Environment Variables

```bash
PORT=3000              # Server port (default: 3000)
NODE_ENV=development   # Environment (development/production)
```

### Policy Configuration

Policies define rate limiting behavior with burst support:

```javascript
{
  id: 1,
  name: "default",
  limit: 100,              // 100 requests allowed...
  window: "1m",            // ...per 1 minute (sustained rate)
  burstLimit: 150,         // Allow burst of 150 requests
  burstWindow: "10s",      // In 10 seconds
  version: 1
}
```

#### Configuration Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Average requests allowed per window |
| `window` | string | Time window (e.g., "1m", "5m", "1h") |
| `burstLimit` | number | Maximum requests in a burst |
| `burstWindow` | string | Duration for burst allowance |

#### Duration Format

- `s` - Seconds (e.g., "10s")
- `m` - Minutes (e.g., "1m", "5m")
- `h` - Hours (e.g., "1h")

---

## 🔌 API Endpoints

### Policy Management

#### GET `/api/policies`
Retrieve all active policies with burst configuration.

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

#### GET `/api/policies/:id`
Get a specific policy by ID.

**Response:** Single policy object

#### GET `/api/policies/:id/stats`
Get policy statistics including burst multiplier.

**Response:**
```json
{
  "data": {
    "policy": { ... },
    "statistics": {
      "averageRateLimit": "100 requests per 1m",
      "burstCapacity": "150 requests per 10s",
      "sustainedRate": "100 requests/1m",
      "burstRate": "150 requests/10s",
      "burst_multiplier": "1.5x"
    }
  }
}
```

#### POST `/api/policies`
Create a new policy with burst configuration.

**Request Body:**
```json
{
  "name": "premium",
  "limit": 1000,
  "window": "1m",
  "burstLimit": 1500,
  "burstWindow": "10s"
}
```

**Response:** Created policy with 201 status

#### PUT `/api/policies/:id`
Update an existing policy and maintain version history.

**Request Body:** Same as create (all fields optional)

#### POST `/api/policies/:id/rollback`
Rollback a policy to its previous version.

**Response:** Rolled-back policy

### Health Check

#### GET `/api/health`
Check API health status.

---

## 🌊 Burst Traffic Handling

### How Burst Works

The token bucket algorithm enables burst traffic handling:

1. **Initialization**: Bucket starts full with `burstLimit` tokens
2. **Request Processing**: Each request consumes 1 token
3. **Token Refill**: Tokens are added at rate = `limit` / `window`
4. **Burst Allowance**: Clients can use all tokens immediately (burst)
5. **Rate Recovery**: System recovers to sustained rate after burst

### Example Scenario

Policy: 100 req/min average, 150 req/10s burst

```
Time    Action                  Tokens  Status
---     ------                  ------  ------
0ms     Request #1              149     ✓ Allowed (burst)
10ms    Request #2-150          0       ✓ All burst allowed
100ms   Request #151            0       ✗ Rate limit exceeded (must wait)
1000ms  (1 sec passed)          ~10     ✓ 10 tokens refilled
5000ms  (5 sec passed)          ~50     ✓ 50 tokens available
10000ms (10 sec passed)         ~100    ✓ 100 tokens available
60000ms (60 sec passed)         100     ✓ Bucket full again
```

### Rate Limit Headers

Response includes burst information:

```
X-RateLimit-Limit: 100              # Average limit
X-RateLimit-Burst-Limit: 150        # Burst capacity
X-RateLimit-Remaining: 45           # Current tokens available
X-RateLimit-Burst-Remaining: 45     # Tokens available for burst
```

---

## 📋 Policy Management

### Creating a Policy

```bash
curl -X POST http://localhost:3000/api/policies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "api-tier",
    "limit": 500,
    "window": "5m",
    "burstLimit": 750,
    "burstWindow": "30s"
  }'
```

### Updating a Policy

```bash
curl -X PUT http://localhost:3000/api/policies/1 \
  -H "Content-Type: application/json" \
  -d '{
    "burstLimit": 200
  }'
```

### Rollback a Policy

```bash
curl -X POST http://localhost:3000/api/policies/1/rollback
```

---

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Unit Tests

Located in `tests/unit/`:
- **burstRateLimiter.test.js**: Token bucket algorithm tests
  - Token consumption
  - Refill rate validation
  - Sustained rate limiting
  - Burst scenarios
  - Edge cases

```bash
npm test -- tests/unit/burstRateLimiter.test.js
```

### Integration Tests

Located in `tests/integration/`:
- **burstPolicy.test.js**: API endpoint tests
  - Policy creation/retrieval
  - Burst configuration validation
  - Policy updates
  - Rate limit headers
  - Rollback functionality

```bash
npm test -- tests/integration/burstPolicy.test.js
```

### Test Coverage

```bash
npm test -- --coverage
```

Generates coverage report in `coverage/` directory.

---

## 💡 Usage Examples

### Example 1: Legitimate Traffic Spike

A mobile app with synchronized background sync creates a burst:

```javascript
// Policy: 100 req/min, burst 150 req/10s
// Time 0ms: 150 users sync immediately (uses burst capacity)
// ✓ All 150 requests allowed
// Time 100ms: 5 more requests arrive
// ✗ Rate limit exceeded, clients must retry after backoff
```

### Example 2: Different Client Tiers

```javascript
// Create bronze tier
POST /api/policies
{
  "name": "bronze",
  "limit": 100,
  "window": "1m",
  "burstLimit": 150,
  "burstWindow": "10s"
}

// Create gold tier
POST /api/policies
{
  "name": "gold",
  "limit": 5000,
  "window": "1m",
  "burstLimit": 10000,
  "burstWindow": "10s"
}
```

### Example 3: Monitor Burst Usage

```bash
# Get policy statistics
curl http://localhost:3000/api/policies/1/stats

# Response includes burst_multiplier showing how much extra
# capacity is available for spikes (e.g., 1.5x = 50% extra)
```

---

## 🔐 Security

- **TLS 1.2+**: All connections enforced to use TLS 1.2 or higher
- **Security Headers**: Helmet.js protects against common vulnerabilities
- **Input Validation**: All policy inputs validated with express-validator
- **CORS**: Cross-origin requests controlled
- **Request Logging**: All requests logged with Morgan

---

## 📊 Monitoring

### Health Checks
Auto-recovery checks run every 5 seconds to monitor system health.

### Rate Limit Monitoring
Each response includes rate limit status in headers:
```
X-RateLimit-Limit
X-RateLimit-Burst-Limit
X-RateLimit-Remaining
X-RateLimit-Burst-Remaining
```

### Logs
- **Access Logs**: Morgan middleware logs all requests
- **TLS Audit Logs**: Tracks TLS configuration changes

---

## 🚀 Future Enhancements

- [ ] Persistent storage (Redis/MongoDB) instead of in-memory
- [ ] Distributed rate limiting across multiple servers
- [ ] Advanced analytics and burst pattern detection
- [ ] WebSocket rate limiting support
- [ ] GraphQL rate limiting
- [ ] Client key management and authentication
- [ ] Custom rate limit rules per endpoint
- [ ] Prometheus metrics export
- [ ] Admin dashboard for policy management
- [ ] Auto-scaling of burst limits based on traffic patterns

---

## 📝 License

This project is part of a Software Engineering course.

---

## 🤝 Contributors

- Course: Software Engineering
- Project: API Rate Limiter with Burst Traffic Support
- Sprint: 1
