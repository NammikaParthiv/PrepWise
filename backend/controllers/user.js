import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(400).json({msg:"Fill all Credentials"});
    }
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({msg:"No User Found"});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({msg:"Invalid Credentials"});
        }
        const token = jwt.sign(
            {id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:"7d"},
        );
        return res.status(200).json({msg:"Login Successful",token,
            user:{
                _id: user._id,
                name: user.name,
                email:user.email,
            }
        });
    }catch(err){
        console.error(err);
        res.status(500).json({msg:"Server Error"});
    }
}

export const registerUser = async(req,res)=>{
    const {name,email,password,profilePic_URL} = req.body;

    if(!name ||!email||!password){
        return res.status(400).json({msg:"Please enter all fields"});
    }
    try{
        let user = await User.findOne({email});
        if(user){
            return res.status(400).json({msg:"Email already exists"});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);
        user = new User({
            name,
            email,
            password: hashedPassword,
            profilePic_URL,
        });
        await user.save();
        return res.status(201).json({msg:"User Registered Successfully"});
    }
    catch(err){
        console.error(err);
        return res.status(500).json({msg:"Error in Server"});
    }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update name
    if (req.body.name) {
      user.name = req.body.name;
    }

    // Update college
    if (req.body.college !== undefined) {
      user.college = req.body.college;
    }

    // Update profile photo
    if (req.file) {
      user.profilePic_URL = `/uploads/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      msg: "Profile Updated Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server Error" });
  }
};