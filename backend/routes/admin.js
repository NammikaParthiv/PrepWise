import express from "express";
import { adminProtect, protect } from "../middlewares/authMiddleware";

const router = express.Router();

router.get("/admim_resume_history",protect,adminProtect,adminResummeHistory);

export default router;