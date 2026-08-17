import { Worker } from "bullmq";
import Interview from "../models/interview.js";
import redisClient from "../config/redis.js";
import bullmqConnection from "../config/bullmq.js";
import { ai } from "../config/gemini.js";

const interviewWorker = new Worker(
  "interviewGenerationQ",
  
  async (job) => {  
    const { job_role } = job.data;
    const normalizedRole = job_role.trim().toLowerCase();
    console.log(`Generating questions for ${job_role}`);
    console.log(job.data);
    try {
      const prompt = `
      Generate exactly 3 realistic technical interview questions for a B.Tech graduating student applying for the job role: ${job_role}.

      The question should feel like something a candidate could actually face in a real company placement interview.

      Requirements:
      - Make the question relevant to the specified job role.
      - Focus on concepts commonly tested in real placement interviews.
      - Prefer practical, application-based, or scenario-based questions over simple textbook definitions.
      - When appropriate, give a realistic situation and ask the candidate what they would do and why.
      - Test understanding, problem-solving, and practical knowledge rather than memorization.
      - Questions should be appropriate for a graduating B.Tech student, not an experienced professional.
      - If the question is a coding/problem-solving question, DO NOT ask for complete code. Ask the candidate to explain the approach, logic, algorithm, or pseudocode.
      - Do NOT ask for language-specific syntax unless it is important to the question.
      - For theoretical questions, phrase them naturally like a real interviewer would during a placement interview.
      - Avoid vague, repetitive, trivial, or overly academic questions.
      - Do not include the answer or explanation.

      Return ONLY a valid JSON array containing exactly 3 question strings.

      Example:
      [
        "Suppose your API suddenly starts receiving 10 times more traffic than usual. How would you identify the bottleneck and what changes would you consider to handle the increased load?"
      ]

      Job Role: ${job_role}
      `;
      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      const response = result.text;

      const cleaned = response
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const questions = JSON.parse(cleaned);
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
