import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import Interview from "../models/interview.js";
import {
  generateInterview,
  submitInterview,
  interviewHistory,
  getInterview,
  transcribeAnswer ,
} from "../controllers/interview.js";
import { ai } from "../config/gemini.js";
import audioUpload from "../utils/audioUpload.js";
import aiRateLimiter from "../middlewares/rateLimiter.js";

const router = express.Router();

router.post("/generate", protect,aiRateLimiter, generateInterview);
router.post("/submit", protect,aiRateLimiter, submitInterview);
router.get("/history", protect, interviewHistory);
router.post("/transcribe", protect, audioUpload.single("audio"), transcribeAnswer);
router.get("/:id", protect, getInterview);
// for finding the error in the gemini_api_key
// router.get("/test-gemini", async(req,res)=>{
//   try {
//     const result = await ai.models.generateContent({
//       model: "gemini-2.5-flash",
//       contents: "Say hello"
//     });

//     res.json({
//       response: result.text
//     });

//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//     status:error.status,
//       error: error.message
//     });
//   }
// });

export default router;
