import mongoose from "mongoose";

const goalSchema = new mongoose.Schema({
    user:{
      type:mongoose.Schema.Types.ObjectId,  
      ref: "User",
      required: true,
    },
    goal_name:{
        type: String,
        required: true,
    },
    completed:{
        type: Boolean,
        default: false,
    }
});

const Goal = mongoose.model("Goal", goalSchema);

export default Goal;