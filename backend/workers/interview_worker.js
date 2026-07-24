import { Worker } from "bullmq";
import Interview from "../models/interview.js";
import redisClient from "../config/redis.js";
import bullmqConnection from "../config/bullmq.js";
import { ai } from "../config/gemini.js";

const interviewWorker = new Worker(
  "interviewGenerationQ",
  
  async (job) => {  
    const { job_role } = job.data;
    console.log(`Generating questions for ${job_role}`);
    console.log(job.data);
    try {
      const prompt = `Generate 2 real-time company interview questions for graduating students from b.tech for the job-role:${job_role}.
     Return only a valid json array as given in the below example:
     example:
      [
        "Question 1",
        "Question 2",
        ...
      ]
     `;
      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const response = result.text;

      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const questions = JSON.parse(cleaned);
      const normalizedRole = job_role.trim().toLowerCase();
      await redisClient.set(
        `interview:${normalizedRole}`,
        JSON.stringify(questions),
        {
            EX: 60*60, //1 hr
        }
      )
      await Interview.updateMany({
        job_role:normalizedRole,
        status: "waiting",
      },{
        $set:{
            questions: questions.map((q)=>({
                question:q,
            })),
            status:"completed",
        },
      });
      
    } catch (error) {

        await Interview.updateMany(
            {
                job_role:normalizedRole,
                status: "waiting",
            },{
                $set:{
                    status:"failed",
                },
            }
        );
      console.log(error);
    }
  },
    {
    connection: bullmqConnection,
    },
);

export default interviewWorker;
