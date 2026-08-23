import Resume from "../models/resume.js";
import { ai } from "../config/gemini.js";
//for enabling the pdfParse in the ESM style instead of the commonJs style
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import fs from "fs";
import path from "path";
import { getAiErrorResponse } from "../utils/aiErrorResponse.js";

export const addResume = async (req, res) => {
  try {
    const { job_description } = req.body;
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);

    const pdfData = await pdfParse(dataBuffer);
        const prompt = `
        You are a strict and honest ATS Resume Screening Assistant.

        Compare the resume with the job description and evaluate the candidate like a real recruiter.

        Be completely evidence-based:
        - Tell the truth even if the resume is a poor match.
        - Never inflate the score or give praise just to be positive.
        - Never assume or invent skills, experience, projects, or qualifications.
        - Give credit only for strengths clearly supported by the resume and relevant to the job.
        - If there are no meaningful strengths, return an empty pros array.
        - If there are no meaningful weaknesses, return an empty cons array.
        - Do not force a fixed number of items.
        - Prioritize important job requirements over minor details.
        - If a required skill is not demonstrated, clearly mention that.

        Return ONLY valid JSON. No markdown, explanations, or extra fields.

        Use EXACTLY this structure:

        {
          "score": 0,
          "pros": [],
          "cons": [],
          "needImprove": []
        }

        Rules:
        - score: realistic match from 0 to 100.
        - pros: genuine job-relevant strengths only.
        - cons: genuine job-relevant weaknesses, missing requirements, or skills not demonstrated.
        - needImprove: specific and actionable recommendations based on the gaps.
        - All three arrays MUST contain only strings.
        - NEVER create objects inside the arrays.
        - NEVER use fields such as "section", "improvement", "reason", or "details".
        - When useful, mention the resume section naturally inside the string, e.g. "Technical Skills: Improve Python proficiency."
        - Do not invent information to fill an array.

        Example of the required format:

        {
          "score": 42,
          "pros": [
            "Strong JavaScript and React experience relevant to the frontend requirements."
          ],
          "cons": [
            "Python experience required by the role is not demonstrated.",
            "Machine learning experience is not demonstrated."
          ],
          "needImprove": [
            "Technical Skills: Develop Python and relevant machine-learning libraries.",
            "Projects: Add a machine-learning project that demonstrates practical Python experience."
          ]
        }

        If there are no genuine positives, use:
        "pros": []

        If there are no genuine weaknesses, use:
        "cons": []

        If no meaningful improvements are needed, use:
        "needImprove": []

        Resume:
        ${pdfData.text}

        Job Description:
        ${job_description}
        `;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    const response = result.text;

    const cleaned = result.text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    let feedback;
    try {
      feedback = JSON.parse(cleaned);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: "Invalid AI response" });
    }

    const score = feedback.score;
    const pros = feedback.pros;
    const cons = feedback.cons;
    const needImprove = feedback.needImprove;

    const newResume = new Resume({
      user: req.user._id,
      resume_name: req.file.originalname,
      job_description,
      score,
      pros,
      cons,
      needImprove,
    });
    await newResume.save();

    fs.unlinkSync(pdfPath); //removes the temp file

    res.status(200).json({ msg: "Your Analysis are Ready", data: newResume });
  } catch (error) {
    console.log(error);
    const aiError = getAiErrorResponse(error);
    return res.status(aiError.status).json(aiError.body);
  }
};

export const resumeHistory = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 6, 50);

    const skip = (page - 1) * limit;

    const [resumes, totalResumes] = await Promise.all([
      Resume.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Resume.countDocuments({ user: req.user._id }),
    ]);

    const totalPages = Math.ceil(totalResumes / limit);

    return res.status(200).json({
      msg: "Your Previous History",
      resumes,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalResumes,
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

export const adminResumeHistory = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Access Denied" });
    }
    let resumes = await Resume.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ msg: "Resume History", resumes: resumes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};
export const getSingleResume = async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) {
    return res.status(404).json({ msg: "Resume not found" });
  }
  if (resume.user.toString() != req.user._id.toString()) {
    return res.status(403).json({ msg: "Access Denied" });
  }
  res.status(200).json(resume);
};
