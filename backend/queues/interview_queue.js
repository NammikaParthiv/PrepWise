import {Queue} from "bullmq";
import  redisClient  from "../config/redis.js";

export const interviewQueue = new Queue("interviewGenerationQ",{
    connection: redisClient,
});