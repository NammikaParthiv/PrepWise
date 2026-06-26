import mongoose from "mongoose";

const connect2DB = async () => {    
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo DB connected Successfully");
  } catch (err) {
    console.log("Database error: ", err.message);
    process.exit(1);
  }
};
export default connect2DB;
