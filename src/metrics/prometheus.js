import client from "prom-client";

const register = new client.Registry();

const requestCount = new client.Counter({
  name: "requests_total",
  help: "Total requests processed",
  labelNames: ["endpoint"]
});

const rejectCount = new client.Counter({
  name: "requests_rejected_total",
  help: "Total rejected requests",
  labelNames: ["endpoint", "reason"]
});

const latencyHistogram = new client.Histogram({
  name: "request_latency_ms",
  help: "Request latency in milliseconds",
  buckets: [5, 10, 25, 50, 100, 200]
});

register.registerMetric(requestCount);
register.registerMetric(rejectCount);
register.registerMetric(latencyHistogram);

export function recordRequest(endpoint) {
  requestCount.inc({ endpoint });
}

export function recordRejection(endpoint, reason) {
  rejectCount.inc({ endpoint, reason });
}

export function recordLatency(ms) {
  latencyHistogram.observe(ms);
}

export async function metricsHandler(req, res) {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
}

export { register };
