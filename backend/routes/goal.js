import express from "express";
import {protect} from "../middlewares/authMiddleware.js";
import { getGoals,addGoal, updateGoal, deleteGoal} from "../controllers/goal.js";

const router = express.Router();

router.get("/",protect,getGoals);
router.post("/",protect,addGoal);
router.put("/:id",protect,updateGoal);
router.delete("/:id",protect,deleteGoal);

export default router;