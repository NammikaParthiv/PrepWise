import express from "express";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        reuired: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ["user","admin"],
        default: "user",
    },
    college:{
        type: String,
        default:""
    },
    profilePic_URL:{
        type: String,
    },
},{timestamps: true});

const User = mongoose.model("User",UserSchema);

// module.exports User;
export default User;