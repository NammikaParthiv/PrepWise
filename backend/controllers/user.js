import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import Interview from "../models/interview.js";
import Resume from "../models/resume.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: "Fill all Credentials" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "No User Found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    return res.status(200).json({
      msg: "Login Successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

export const registerUser = async (req, res) => {
  const { name, email, password, profilePic_URL } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user = new User({
      name,
      email,
      password: hashedPassword,
      profilePic_URL,
    });
    await user.save();
    return res.status(201).json({ msg: "User Registered Successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Error in Server" });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const interviews = await Interview.find({ user: req.user._id });
    const resumes = await Resume.find({ user: req.user._id });

    const totalInterviews = interviews.length;
    const totalResumes = resumes.length;

    const bestInterviewScore = interviews.length > 0
      ? Math.max(...interviews.map((i) => i.overallScore || 0))
      : 0;

    const bestResumeScore = resumes.length > 0
      ? Math.max(...resumes.map((r) => r.score || 0))
      : 0;

    const userProfileData = {
      ...user.toObject(),
      stats: {
        totalInterviews,
        totalResumes,
        bestInterviewScore,
        bestResumeScore,
      },
    };

    res.status(200).json(userProfileData);
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

    if (req.body.name !== undefined) {
      user.name = req.body.name;
    }

    if (req.body.college !== undefined) {
      user.college = req.body.college;
    }

    if (req.body.phone !== undefined) {
      user.phone = req.body.phone;
    }

    if (req.body.gender !== undefined) {
      user.gender = req.body.gender;
    }

    if (req.file) {
      if (user.profilePic_URL) {
        const oldFilePath = path.join(process.cwd(), user.profilePic_URL.replace(/^\/+/, ""));
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

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

export const deleteProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    if (user.profilePic_URL) {
      const filePath = path.join(process.cwd(), user.profilePic_URL.replace(/^\/+/, ""));

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      user.profilePic_URL = "";
      await user.save();
    }

    return res.status(200).json({
      msg: "Profile photo removed successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server Error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ msg: "User with this email does not exist." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const mailOptions = {
      from: `"PrepWise" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset OTP - PrepWise",
      html: `
        <h2>PrepWise Password Reset</h2>
        <p>Your OTP code to reset your password is:</p>
        <h1 style="font-size: 32px; color: #16a34a; letter-spacing: 4px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewURL = nodemailer.getTestMessageUrl(info);

    return res.status(200).json({ 
      msg: "OTP sent to the link successfully.",
      previewUrl: previewURL
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ msg: "Server error sending OTP email." });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOTP !== otp ||
      !user.resetOTPExpires ||
      user.resetOTPExpires < Date.now()
    ) {
      return res.status(400).json({ msg: "Invalid or expired OTP." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    return res.status(200).json({ msg: "Password changed successfully!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ msg: "Server error resetting password." });
  }
};