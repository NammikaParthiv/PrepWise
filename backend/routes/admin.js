import express from "express";
import { adminProtect, protect } from "../middlewares/authMiddleware.js";
import { getStats, getUsers,references, addReferences } from "../controllers/admin.js";

const router = express.Router();

router.get("/statistics", protect, adminProtect, getStats);
router.get("/users", protect, adminProtect, getUsers);
router.get("/reference", protect, adminProtect, references);
router.post("/add_reference", protect, adminProtect, addReferences);

export default router;
