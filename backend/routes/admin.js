import express from "express";
import { adminProtect, protect } from "../middlewares/authMiddleware.js";
import { getStats, getUsers } from "../controllers/admin.js";

const router = express.Router();

router.get("/statistics", protect, adminProtect, getStats);
router.get("/users", protect, adminProtect, getUsers);

export default router;
