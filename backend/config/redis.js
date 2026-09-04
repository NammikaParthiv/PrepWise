import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
});
redisClient.on("connect", () => {
    console.log("Redis Connected");
})
redisClient.on("error", (err) => {
    console.log("Redis connection Failed",err);
})

export default redisClient;