import "./config/env.js";
import express from "express";
import cors from "cors";
import path from "path";
const PORT = process.env.PORT || 2222;

import connect2DB  from "./connect2DB.js";
import redisClient from "./config/redis.js";
import "./workers/index.js";

import resumeRoutes from "./routes/resume.js"
import userRoutes from "./routes/user.js";
import interviewRoutes from "./routes/interview.js";
import adminRoutes from "./routes/admin.js";
import goalRoutes from "./routes/goal.js";
import referenceRoutes from "./routes/reference.js";


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const allowedOrigins= [
    process.env.CLIENT_URL,
    "http://localhost:5173"
];
//console.log("CLIENT_URL =", process.env.CLIENT_URL);
app.use(cors({
    origin: function (origin,callback){
        if(!origin ||allowedOrigins.includes(origin)){
            callback(null, true);
        }else{
            callback(new Error("Not allowed by cors"));
        }
    },
    credentials: true,
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