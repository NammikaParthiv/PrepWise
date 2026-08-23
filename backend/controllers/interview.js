import Interview from "../models/interview.js";
import { ai } from "../config/gemini.js";
import {interviewQueue} from "../queues/interview_queue.js"
import redisClient from "../config/redis.js";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";
import { getAiErrorResponse } from "../utils/aiErrorResponse.js";

const WHISPER_API_URL = process.env.WHISPER_API_URL || "http://localhost:8000/v1/audio/transcriptions";
const WHISPER_MODEL = process.env.WHISPER_MODEL || "Systran/faster-distil-whisper-small.en";


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
        job_role: normalizeRole,
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
      job_role: normalizeRole,
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

    const questionsWithAnswers = interview.questions.map((q, index) => ({
       question: q.question,
       candidateAnswer: answers[index]?.answer?.trim() || ""
       }));

        let prompt = `
        You are a senior Frontend, Backend and Full Stack technical interviewer evaluating a real-world interview.

        Evaluate ONLY what the candidate actually demonstrated. Never assume knowledge they did not show.

        CORE RULE:
        For every question, merits + demerits must together form a COMPLETE, technically correct, interview-ready answer to the original question.

        MERITS:
        - Include ONLY technically correct information actually demonstrated by the candidate.
        - Give meaningful credit for valid reasoning, practical approaches, and relevant technical knowledge even if the approach is incomplete or not the best production approach.
        - Never put knowledge in merits that the candidate did not demonstrate.
        - Do not treat a reasonable alternative approach as completely wrong merely because a better approach exists.

        DEMERITS:
        - Provide the ACTUAL CORRECT missing, incorrect, or improved technical content.
        - Never write only "explain X", "mention Y", "use a better approach", or similar instructions.
        - If the candidate's approach is valid but has limitations, preserve it in merits and explain the better/production approach, why it is better, and how it should actually be implemented.
        - If the candidate is partially correct, keep the correct parts in merits and provide the remaining complete explanation in demerits.
        - If the candidate is technically incorrect, explain the correct approach completely.
        - If there is no meaningful answer, provide the complete correct answer in demerits.
        - Do not repeat information already demonstrated in merits.

        COMPLETE ANSWER:
        Include the important information reasonably expected in a real Frontend/Backend/Full Stack interview, depending on the question:
        - Definition and purpose when relevant.
        - How it works.
        - Real-world application.
        - Implementation approach.
        - Request/response or data flow when relevant.
        - Important components and their responsibilities.
        - Security considerations when relevant.
        - Performance/scalability considerations when relevant.
        - Error handling and edge cases when relevant.
        - Advantages, limitations, and trade-offs when relevant.
        - Practical examples when useful.
        Do not add irrelevant information.

        SCORING:
        0 = no answer, completely irrelevant answer, or technically invalid answer with no meaningful correct knowledge.
        1-3 = very limited understanding or mostly incorrect explanation.
        4-6 = meaningful partial understanding or a valid approach with important missing details/limitations.
        7-8 = strong practical understanding with some missing details.
        9 = very strong and nearly complete understanding.
        10 = technically correct, complete, relevant, well-reasoned, and clearly explained.

        A reasonable and technically valid approach must receive meaningful credit even if it is not the best production approach.
        Do not give a very low score merely because the candidate missed an optimization, best practice, alternative technology, or advanced detail.
        However, incorrect, unsafe, impractical, or fundamentally misunderstood approaches should be penalized appropriately.
        Score based on correctness, practical understanding, reasoning, completeness, and importance of missing knowledge, NOT by counting merits/demerits.
        Minor English or grammar mistakes should not significantly affect technical scoring.

        AREAS:
        - strongAreas = topics the candidate demonstrated well.
        - weakAreas = topics where the candidate was incorrect, incomplete, unclear, or lacked important practical knowledge.
        - suggestions = specific actionable improvements for weak areas. Never invent resources.

        OUTPUT ONLY VALID JSON:

        {
          "overallScore": 85,
          "strongAreas": "...",
          "weakAreas": "...",
          "suggestions": "...",
          "questions": [
            {
              "score": 7,
              "merits": ["..."],
              "demerits": ["..."]
            }
          ]
        }

        STRICT:
        - Return only valid JSON.
        - No markdown or text outside JSON.
        - No extra fields.
        - merits and demerits must contain only strings.
        - Number of question objects MUST exactly match the number of questions.
        - Preserve the original question order.
        - Never put undemonstrated knowledge in merits.
        - Demerits must contain the actual complete correct explanation, not merely what the candidate should mention.
        - merits + demerits must together represent the complete answer to the question.

        INTERVIEW:
        ${questionsWithAnswers.map((q, i) => `
        Question ${i + 1}: ${q.question}
        Candidate Answer: ${q.candidateAnswer || "[NO ANSWER PROVIDED]"}
        `).join("\n")}
        `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
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
      interview.questions[index].answer = questionsWithAnswers[index]?.candidateAnswer || "";
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

    const aiError = getAiErrorResponse(error);
    return res.status(aiError.status).json(aiError.body);
  }
};

export const interviewHistory = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 6, 50);

    const skip = (page - 1) * limit;

    const [interviews, totalInterviews] = await Promise.all([
      Interview.find({
        user: req.user._id,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Interview.countDocuments({
        user: req.user._id,
      }),
    ]);

    const totalPages = Math.ceil(totalInterviews / limit);

    res.status(200).json({
      msg: "Interview History",
      interviews,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalInterviews,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Server Error",
      error: error.message,
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

export const transcribeAnswer = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!filePath) {
      return res.status(400).json({ msg: "No audio file received" });
    }

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), {
      filename: req.file.filename,
      contentType: "audio/webm",
    });
    form.append("model", WHISPER_MODEL);
    form.append("language", "en");
    form.append("response_format", "json");
    form.append("vad_filter", "true");

    const whisperRes = await axios.post(WHISPER_API_URL, form, {
      headers: form.getHeaders(),
      timeout: 60000,
    });

    const text = whisperRes.data?.text?.trim() || "";

    return res.status(200).json({ text });
  } catch (error) {
    console.error("Transcription error:", error.message);
    return res.status(503).json({
      msg: "Voice transcription service is unavailable right now. Your answer could not be transcribed clearly.",
      code: "TRANSCRIPTION_SERVICE_ERROR",
    });
  } finally {
    // Always clean up the temp file, whether transcription succeeded or not.
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp audio file:", err);
      });
    }
  }
};
