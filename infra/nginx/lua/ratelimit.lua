local redis = require "resty.redis"
local cjson = require "cjson.safe"

local function respond(code, body)
  ngx.status = code
  ngx.header["Content-Type"] = "application/json"
  ngx.say(cjson.encode(body))
  return ngx.exit(code)
end

local red = redis:new()
red:set_timeout(1000)
local ok, err = red:connect("redis", 6379)
if not ok then
  ngx.log(ngx.ERR, "redis connect error: ", err)
  return respond(500, { error = "redis error" })
end

local identifier = ngx.req.get_headers()["x-api-key"] or ngx.var.remote_addr or "anon"
local window = 60
local limit = 100
local now = ngx.time()
local window_key = identifier .. ":" .. tostring(math.floor(now / window))

local res, err = red:incr(window_key)
if tonumber(res) == 1 then red:expire(window_key, window) end

if tonumber(res) > limit then
  ngx.header["Retry-After"] = tostring(window - (now % window))
  return respond(429, { error = "rate limit exceeded" })
end
