return {
  name = "rate-limit",
  fields = {
    { redis_host = { type = "string", default = "127.0.0.1" }},
    { redis_port = { type = "number", default = 6379 }},
    { limit = { type = "number", default = 100 }},
    { window = { type = "number", default = 60 }},
  }
}
