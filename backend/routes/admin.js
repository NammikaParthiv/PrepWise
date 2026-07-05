import express from "express";
import { adminProtect, protect } from "../middlewares/authMiddleware.js";
import { getStats, getUsers,references, addReferences,deleteReference } from "../controllers/admin.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/statistics", protect, adminProtect, getStats);
router.get("/users", protect, adminProtect, getUsers);
router.get("/reference", protect, adminProtect, references);
router.post("/add_reference", protect, adminProtect,upload.single("file"), addReferences);
router.delete("/reference/:id", protect, adminProtect, deleteReference);

export default router;
