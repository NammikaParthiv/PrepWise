import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    job_role: {
      type: String,
      required: true,
    },
    questions: [
      {
        question: {
          type: String,
        },
        answer: {
          type: String,
          default: "",
        },
        score: {
          type: Number,
          default: 0,
        },
        merits: [String],
        demerits: [String],
      },
    ],
    overallScore: {
      type: Number,
      default: 0,
    },
    strongAreas: {
      type: String,
    },
    weakAreas: {
      type: String,
    },
    suggestions: {
      type: String,
    },
  },
  { timestamps: true },
);

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
