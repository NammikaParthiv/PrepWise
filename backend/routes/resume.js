import express from "express";
import {protect} from "../middlewares/authMiddleware.js";
import {addResume , resumeHistory, adminResumeHistory, getSingleResume} from "../controllers/resume.js"
import upload from "../utils/multer.js"


const router = express.Router();

router.post("/addResume",upload.single("resume"),protect,addResume);
router.get("/admin_resume_history",protect,adminResumeHistory);
router.get("/resume_history/:id",protect,getSingleResume);
router.get("/resume_history",protect,resumeHistory);
export default router;