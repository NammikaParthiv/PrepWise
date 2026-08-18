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

      if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end

      return current
      `,
      {
        keys: [key],
        arguments: [String(24 * 60 * 60)], // 24 hours
      }
    );

    const currentCount = Number(count);

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
        msg: "You have reached your daily AI request limit. Please try again tomorrow.",
        retryAfterSeconds: Math.max(ttl, 0),
      });
    }

    next();

  } catch (error) {
    console.error("AI rate limiter error:", error);

    return res.status(503).json({
      msg: "Rate limiting service is temporarily unavailable.",
    });
  }
};

export default aiRateLimiter;