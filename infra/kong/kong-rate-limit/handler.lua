local BasePlugin = require "kong.plugins.base_plugin"
local responses = require "kong.tools.responses"
local redis = require "resty.redis"

local RateLimitHandler = BasePlugin:extend()
RateLimitHandler.PRIORITY = 950

function RateLimitHandler:new()
  RateLimitHandler.super.new(self, "rate-limit")
end

function RateLimitHandler:access(conf)
  RateLimitHandler.super.access(self)

  local red = redis:new()
  red:set_timeout(1000)
  local ok, err = red:connect(conf.redis_host or "127.0.0.1", conf.redis_port or 6379)
  if not ok then
    return responses.send_HTTP_INTERNAL_SERVER_ERROR("redis error")
  end

  local identifier = kong.request.get_header("x-api-key") or kong.client.get_ip()
  local window = conf.window or 60
  local limit = conf.limit or 100
  local now = ngx.time()
  local window_key = identifier .. ":" .. tostring(math.floor(now/window))

  local res, err = red:incr(window_key)
  if tonumber(res) == 1 then red:expire(window_key, window) end

  if tonumber(res) > limit then
    kong.response.set_header("Retry-After", tostring(window - (now % window)))
    return responses.send(429, { message = "rate limit exceeded" })
  end
end

return RateLimitHandler
