import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { loginUser, registerUser, getProfile,updateProfile } from "../controllers/user.js";
import { getReferences } from "../controllers/admin.js";
import upload from "../utils/multer.js";
const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.get("/profile", protect, getProfile);
router.get("/references", protect, getReferences);
router.put("/profile", protect, upload.single("profilePic"), updateProfile);

export default router;
