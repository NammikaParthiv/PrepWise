import Resume from "../models/resume.js";
import { ai } from "../config/gemini.js";
//for enabling the pdfParse in the ESM style instead of the commonJs style
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

import fs from "fs";
import path from "path";

export const addResume = async (req, res) => {
  try {
    const { job_description } = req.body;
    const pdfPath = req.file.path;
    const dataBuffer = fs.readFileSync(pdfPath);

    const pdfData = await pdfParse(dataBuffer);

    const prompt = `
You are an ATS Resume Screening Assistant.

Compare the resume with the provided job description.

Return ONLY valid JSON.

{
  "score": 85,
  "pros":"...",
  "cons":"...",
  "needImprove":"..."
}

Resume:
${pdfData.text}

Job Description:
${job_description}
`;
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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
    if (error.status === 503) {
      return res.status(200).json({
        score: 0,
        pros: "AI is not available currently",
        cons: "AI is not avaliable currently",
        needImprove: "AI is not avaliable currently",
      });
    }
    console.log(error);
    return res.status(500).json({ msg: "Server Error", error });
  }
};

export const resumeHistory = async (req, res) => {
  try {
    let resumes = await Resume.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    return res
      .status(200)
      .json({ msg: "Your Previous History", resumes: resumes });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error", error: error.message });
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
