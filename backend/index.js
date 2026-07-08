import "./config/env.js";
import express from "express";
import cors from "cors";
import path from "path";
const PORT = process.env.PORT || 2222;
import connect2DB  from "./connect2DB.js";
import resumeRoutes from "./routes/resume.js"
import userRoutes from "./routes/user.js";
import interviewRoutes from "./routes/interview.js";
import adminRoutes from "./routes/admin.js";
import goalRoutes from "./routes/goal.js";
import referenceRoutes from "./routes/reference.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    credentials: true,
    origin:"http://localhost:5173"
}));

connect2DB();

app.use("/api/user",userRoutes);
app.use("/api/resume_analyser",resumeRoutes);
app.use("/api/interview",interviewRoutes);
app.use("/api/admin",adminRoutes);
app.use("/api/goals",goalRoutes);
app.use("/api/references",referenceRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, ()=>{
    console.log(`Server Started at PORT: ${PORT}`);
});