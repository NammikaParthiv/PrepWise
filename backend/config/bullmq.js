import IORedis from "ioredis";

const bullmqConnection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        maxRetriesPerRequest: null,
    }
);

export default bullmqConnection;