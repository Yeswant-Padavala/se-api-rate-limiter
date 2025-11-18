import { RedisCounter } from "../../../src/services/redisCounter.js";

test("increments user counter", async () => {
  const redis = {
    incr: jest.fn().mockResolvedValue(1),
    expire: jest.fn()
  };

  const counter = new RedisCounter(redis, 60);
  const count = await counter.increment("user1");

  expect(count).toBe(1);
  expect(redis.expire).toHaveBeenCalled();
});
