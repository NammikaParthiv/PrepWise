import express from "express";
import { getReferences,addReferences, deleteReference, updateReference, reorderReferences } from "../controllers/admin.js";
import { protect, adminProtect } from "../middlewares/authMiddleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.get("/", protect, getReferences);
router.post("/add_reference", protect, adminProtect,upload.single("file"), addReferences);
router.put("/reorder",protect,adminProtect, reorderReferences);
router.delete("/:id", protect, adminProtect, deleteReference);
router.put("/:id", protect, adminProtect, updateReference);

export default router;