import Interview from "../models/interview.js";
import { ai } from "../config/gemini.js";
import {interviewQueue} from "../queues/interview_queue.js"
import redisClient from "../config/redis.js";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

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
        You are a senior technical interviewer evaluating a candidate's mock interview.
        Evaluate ONLY what the candidate actually said. Never assume or invent knowledge.

        CORE RULE:
        For every question, "merits" + "demerits" together must represent a COMPLETE, technically correct interview answer to that question, including definitions, concepts, reasoning, steps, implementation/application, examples, and complexity wherever relevant.

        Rules:
        - merits = ONLY correct technical information actually demonstrated by the candidate.
        - demerits = the remaining information needed to make the answer complete and technically correct.
        - Demerits must contain the ACTUAL CORRECT CONTENT the candidate should know, not merely statements such as "should explain X" or "needs to mention Y".
        - If a concept requires explaining HOW to apply or implement it, include the actual steps/logic in demerits.
        - If the candidate fails to explain an application, algorithm, process, example, implementation, or reasoning, provide that complete missing explanation in demerits.
        - Do NOT assume the candidate knows something just because they mentioned the concept.
        - Never put an ideal-answer point in merits unless the candidate actually demonstrated it.
        - Do not repeat the same information in merits and demerits.
        - If the answer is partially correct, preserve the candidate's correct points in merits and provide the remaining complete answer in demerits.
        - If the answer is completely correct and complete, demerits may be [].
        - If there is NO ANSWER:
          - score = 0
          - merits = []
          - demerits = the COMPLETE technically correct answer that the candidate should have given.
        - For unanswered questions, do not merely say "No answer provided" or list topic names.
        - Demerits must be useful for learning: a candidate should be able to read merits + demerits and understand how to answer the question correctly in an interview.
        - Include relevant examples, steps, implementation logic, use cases, trade-offs, and time/space complexity when they are important to the question.
        - Do not add irrelevant details that are not expected for the question.
        - Do not use generic merits such as "Good answer".
        - Minor English/grammar mistakes should not significantly affect technical scoring.
        - strongAreas = topics the candidate demonstrated well.
        - weakAreas = topics where the candidate's knowledge was incomplete, incorrect, or unclear.
        - suggestions = specific improvements for weak areas and reliable learning resources. Never invent resources.

        SCORING:
        - score: 0-10
        - 0 = no answer, irrelevant answer, or no meaningful correct knowledge.
        - 1-3 = very limited understanding.
        - 4-6 = partial understanding with important missing concepts.
        - 7-8 = good understanding with some missing details.
        - 9 = very strong and nearly complete.
        - 10 = correct, complete, relevant, and clearly explained.
        - Score based on correctness, completeness, and importance of the demonstrated knowledge, NOT by counting merits/demerits.
        - overallScore: 0-100 based on performance across all questions.

        OUTPUT:

        Return ONLY valid JSON:

        {
          "overallScore": 85,
          "strongAreas": "...",
          "weakAreas": "...",
          "suggestions": "...",
          "questions": [
            {
              "score": 8,
              "merits": [
                "Correctly explained ..."
              ],
              "demerits": [
                "The complete missing explanation is ..."
              ]
            }
          ]
        }

        STRICT RULES:
        - No markdown.
        - No explanations outside JSON.
        - No extra fields.
        - merits and demerits must contain ONLY strings.
        - Number of question objects MUST exactly match the number of questions.
        - Keep the original question order.
        - Never put information in merits that the candidate did not actually demonstrate.
        - Demerits must contain the actual correct missing content, not just a description of what is missing.

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
    return res.status(500).json({ msg: "Failed to transcribe audio" });
  } finally {
    // Always clean up the temp file, whether transcription succeeded or not.
    if (filePath) {
      fs.unlink(filePath, (err) => {
        if (err) console.error("Failed to delete temp audio file:", err);
      });
    }
  }
};
