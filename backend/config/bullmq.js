import IORedis from "ioredis";

const bullmqConnection = new IORedis(
    process.env.REDIS_URL || "redis://localhost:6379",
    {
        //upto how many times will the client retry the redis command before giveup.
        //maxRetriesPerRequest: 3,
        maxRetriesPerRequest: null,//No limit

        // reconnectOnError: (err) => {
        //     const targetError = "READONLY";
        //     if (err.message.includes(targetError)) {
        //         /*reconnect if Redis is in a failover state*/
        //         return true;
        //     }
        //     return false;
        // },
    }
);

export default bullmqConnection;