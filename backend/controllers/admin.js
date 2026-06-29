import User from "../models/user";

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
        const users = User.findMany({role:"user"});
     } catch (error) {
       console.loh(error);
       return res.status(500).json({msg:"Server Error"});
     }
}