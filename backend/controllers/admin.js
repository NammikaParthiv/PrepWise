import User from "../models/user.js";

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