export const adminResummeHistory = (req,res)=>{
     try {
        
     } catch (error) {
        console.log(error);
        return res.status(500).josn({msg:"Server error",error:error.message});
     }
}