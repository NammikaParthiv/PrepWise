import {Queue} from "bullmq";
import bullmqConnection from "../config/bullmq.js";

export const interviewQueue = new Queue(
    "interviewGenerationQ",
    {
      connection: bullmqConnection,
    }
);