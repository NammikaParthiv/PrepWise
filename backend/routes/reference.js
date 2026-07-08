import express from "express";
import { getReferences,addReferences, deleteReference } from "../controllers/admin.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/", protect, getReferences);
router.post("/add_reference", protect, adminProtect,upload.single("file"), addReferences);
router.delete("/:id", protect, adminProtect, deleteReference);

export default router;