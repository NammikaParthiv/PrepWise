import redisClient from "../config/redis.js";

const aiRateLimiter = async (req, res, next) => {
  try {
    // User must be logged in
    if (!req.user?._id) {
      return res.status(401).json({
        msg: "Authentication required",
      });
    }

    const userId = req.user._id.toString();

    // One counter per user
    const key = `rate:ai:user:${userId}`;

    const count = await redisClient.eval(
      `
      local current = redis.call("INCR", KEYS[1])
      local ttl = redis.call("TTL", KEYS[1])

      if current == 1 or ttl == -1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end

      return current
      `,
      {
        keys: [key],
        arguments: [String(24 * 60 * 60)],//24 hrs
      }
    );

    const currentCount = Number(count);

    const ttl = await redisClient.ttl(key);

    console.log("AI RATE LIMIT:", {
      userId,
      key,
      currentCount,
      ttl,
    });

    const remaining = Math.max(5 - currentCount, 0);

    res.setHeader("X-RateLimit-Limit", 5);
    res.setHeader("X-RateLimit-Remaining", remaining);

    // More than 5 requests
    if (currentCount > 5) {
      const ttl = await redisClient.ttl(key);

      res.setHeader(
        "Retry-After",
        Math.max(ttl, 0)
      );

      return res.status(429).json({
        msg: "Today's AI limit has been reached. Please check again tomorrow.",
        code: "DAILY_AI_LIMIT_REACHED",
        retryAfterSeconds: Math.max(ttl, 0),
      });
    }

    next();

  } catch (error) {
    console.error("AI rate limiter error:", error);

    return res.status(503).json({
      msg: "AI usage limit service is temporarily unavailable. Please try again after some time.",
      code: "RATE_LIMITER_UNAVAILABLE",
    });
  }
};

export default aiRateLimiter;
