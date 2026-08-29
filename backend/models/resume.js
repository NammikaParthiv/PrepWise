import mongoose from "mongoose";

const ResumeSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
    },
    resume_name:{
        type: String,
        required: true,
    },
    job_description:{
        type: String,
        required: true,
    },
    score:{
        type: Number,
    },
    pros:{
        type:[String],
        default:[],
    },
    cons:{
        type:[String],
        default:[],
    },
    needImprove:{
        type:[String],
        default:[],
    }
} ,{timestamps: true});

const Resume = mongoose.model("resume",ResumeSchema);

export default Resume;