import User from "../models/user.js";
import Resume from "../models/resume.js";
import Interview from "../models/interview.js";
export const references =async(req,res)=>{
   try {
      
   } catch (error) {
      console.log(error);
      return res.status(500).json({msg:"Server error"});
   }
}

export const addReferences = (req,res)=>{
     try {
        
     } catch (error) {
        console.log(error);
        return res.status(500).josn({msg:"Server error",error:error.message});
     }
}

export const getStats = async(req,res)=>{
    try{
        const totalUsers = await User.countDocuments({role:"user"});
        const resumesAnalysed = await Resume.countDocuments();
        const interviewsTaken = await Interview.countDocuments();
         return res.status(200).json({msg:"Stats fetched",stats:{totalUsers,resumesAnalysed,interviewsTaken}});
    }catch(error){
      console.log(error);
      return res.status(500).json({msg:"Server error"});
    }
}

export const getUsers = async(req,res)=>{
     try {
        const users = await User.find({role:"user"});
        return res.status(200).json({msg:"Users rendered",users});
     } catch (error) {
       console.log(error);
       return res.status(500).json({msg:"Server Error"});
     }
}