import express from "express";
import { adminProtect, protect } from "../middlewares/authMiddleware.js";
import { getStats, getUsers, deleteUser } from "../controllers/admin.js";

const router = express.Router();

router.get("/statistics", protect, adminProtect, getStats);
router.get("/users", protect, adminProtect, getUsers);
router.delete("/users/:id", protect, adminProtect, deleteUser);

export default router;
