import Interview from "../models/interview.js";
import { ai } from "../config/gemini.js";
import {interviewQueue} from "../queues/interview_queue.js"
import redisClient from "../config/redis.js";

export const generateInterview = async (req, res) => {
  const { job_role } = req.body;

  if (!job_role) {
    return res.status(400).json({ msg: "Job role is required" });
  }

    try{
      //console.log("1. Request received");

    const normalizeRole = job_role.trim().toLowerCase();
    //console.log("2. job role normalised");

    // if(!redisClient.isReady){
    //    return res.status(503).json({
    //       msg:"Interview service is temporarily unavaliable",
    //    });
    // }
    const cachedQuestions = await redisClient.get(
      `interview:${normalizeRole}`
      );
      //console.log("3. Checked redis");

    if(cachedQuestions){
      const questions = JSON.parse(cachedQuestions);

      const interview = await Interview.create({
        user: req.user._id,
        job_role,
        questions: questions.map((q)=>({
          question:q,
        })),
        status: "completed",
      });

      return res.status(201).json({
        msg:"Interview generated successfully",interview,
      });
    }
      //console.log("4. Not Found in Cache");

    const interview = await Interview.create({
      user: req.user._id,
      job_role,
      questions:[],
      status:"waiting",
    });
    
     const existingInterview = await interviewQueue.getJob(normalizeRole);
     //console.log("5. BULLMQ received");

     if(!existingInterview){
        await interviewQueue.add(
          "generateInterview",{
            job_role:normalizeRole,
          },{
            jobId: normalizeRole,
            removeOnComplete: true,
          }
        );
    }
    //console.log("6. Checked all clear");

    return res.status(202).json({
      msg:"Interview is being generated",
      interviewId : interview._id,
    });
  // try {
  //   const prompt = `Generate 1 real-time company interview questions for graduating students from b.tech for the job-role:${job_role}.
  //    Return only a valid json array as given in the below example:
  //    example:
  //     [
  //       "Question 1",
  //       "Question 2",
  //     ]
  //    `;
  //   const result = await ai.models.generateContent({
  //     model: "gemini-2.5-flash",
  //     contents: prompt,
  //   });

  //   const response = result.text;

  //   const cleaned = response
  //     .replace(/```json/g, "")
  //     .replace(/```/g, "")
  //     .trim();
  //   const questions = JSON.parse(cleaned);

  //   const interview = await Interview.create({
  //     user: req.user._id,
  //     job_role,
  //     questions: questions.map((q) => ({
  //       question: q,
  //     })),
  //   });
  //   res
  //     .status(201)
  //     .json({ msg: "Interview Generated Successfully", interview });
  // } catch (error) {
  //   console.log(error);
  //   return res.status(500).json({ msg: "Server error", errror: error.message });
  // }
   }catch(error){
      console.log(error);
      return res.status(500).json({msg:"Server error"});
   };

  };

export const submitInterview = async (req, res) => {
  const { interviewId, answers } = req.body;

  try {
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        msg: "Interview not found",
      });
    }

    interview.questions.forEach((q, index) => {
      q.answer = answers[index]?.answer || "";
    });

    let prompt = `
     You are a senior technical interviewer.
     Evaluate the complete interview.
     Return ONLY valid JSON.Interview:`;

    interview.questions.forEach((q, i) => {
      prompt += `
      Question ${i + 1}:${q.question}
      Answer:${q.answer}`;
    });

    prompt += `Return exactly in this format:
      {
       "overallScore":85,
       "strongAreas":"...",
       "weakAreas":"...",
       "suggestions":"...",
       "questions":[
      {
       "score":8,
       "merits":["point1","point2"],
       "demerits":["point1","point2"]
       }
     ]
   }`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    if (!result || !result.text) {
      throw new Error("AI returned an empty response.");
    }
    const cleaned = result.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const feedback = JSON.parse(cleaned);

    interview.overallScore = feedback.overallScore;
    interview.strongAreas = feedback.strongAreas;
    interview.weakAreas = feedback.weakAreas;
    interview.suggestions = feedback.suggestions;

    feedback.questions.forEach((item, index) => {
      interview.questions[index].score = item.score;
      interview.questions[index].merits = item.merits;
      interview.questions[index].demerits = item.demerits;
    });

    await interview.save();

    return res.status(200).json({
      msg: "Interview Submitted Successfully",
      interview,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
  }
};

export const interviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      msg: "Interview History",
      interviews,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Server Error",
    });
  }
};

export const getInterview = async (req, res) => {
  const { id } = req.params;
  try {
    const interview = await Interview.findById(id);
    if (!interview) {
      return res.status(404).json({ msg: "Interview not found" });
    }
    if (interview.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Unauthorized" });
    }
    res.status(200).json({ interview });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};