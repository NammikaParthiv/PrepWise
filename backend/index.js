import "./config/env.js";
import express from "express";
import cors from "cors";
import path from "path";
const PORT = process.env.PORT || 2222;
import connect2DB  from "./connect2DB.js";
import Resume from "./models/resume.js";
import ResumeRoutes from "./routes/resume.js"
import UserRoutes from "./routes/user.js";
import InterviewRoutes from "./routes/interview.js";
import adminRoutes from "./routes/admin.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({
    credentials: true,
    origin:"http://localhost:5173"
}));

connect2DB();


app.use("/api/user",UserRoutes);
app.use("/api/resume_analyser",ResumeRoutes);
app.use("/api/interview",InterviewRoutes);
app.use("/api/admin",adminRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(PORT, ()=>{
    console.log(`Server Started at PORT: ${PORT}`);
})