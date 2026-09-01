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
  cloudinary_public_id: {
    type: String,
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
    enum: ["Frontend", "Backend", "DSA","Practise","CS_core"],
    required: true,
  },
  order:{
    type: Number,
    default: 0,
  },

},{timestamps: true});

export default mongoose.model("Reference", referenceSchema);
