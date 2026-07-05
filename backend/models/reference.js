import mongoose from "mongoose";

const referenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  photo_url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["pdf", "photo"],
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ["Frontend", "Backend", "DSA"],
    required: true,
  },
},{timestamps: true});

export default mongoose.model("Reference", referenceSchema);
