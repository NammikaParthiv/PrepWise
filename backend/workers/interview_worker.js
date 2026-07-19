import {Worker} from "bullmq";
import redisClient from "../config/redis.js";

const interviewWorker = new Worker("interviewGenerationQ",
    async(job)=>{
        console.log("Worker received JOb:");
        console.log(job.data);
    },{
        connection: redisClient,
    }
);

export default interviewWorker;