import User from "../models/user.js";
import Resume from "../models/resume.js";
import Interview from "../models/interview.js";
import Reference from "../models/reference.js";

export const getReferences = async (req, res) => {
  try {
    const refs = await Reference.find();
    const grouped = { Frontend: [], Backend: [], DSA: [] };

    refs.forEach((ref) => {
      grouped[ref.category].push(ref);
    });

    return res.json(grouped);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const addReferences = async(req, res) => {
  try {
    const { category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ msg: "File is required" });
    }

    const newRef = new Reference({
      name: file.originalname.split(".")[0],
      photo_url: `/uploads/${file.filename}`, 
      type: file.mimetype === "application/pdf" ? "pdf" : "photo",
      date: new Date().toLocaleDateString(),
      category
    });

    await newRef.save();

    const refs = await Reference.find();
    const grouped = { Frontend: [], Backend: [], DSA: [] };
    refs.forEach(ref => grouped[ref.category].push(ref));
    return res.json(grouped);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "user" });
    const resumesAnalysed = await Resume.countDocuments();
    const interviewsTaken = await Interview.countDocuments();
    return res
      .status(200)
      .json({
        msg: "Stats fetched",
        stats: { totalUsers, resumesAnalysed, interviewsTaken },
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" });
    return res.status(200).json({ msg: "Users rendered", users });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server Error" });
  }
};

export const deleteReference = async (req, res) => {
   try {
    const { id } = req.params;
    await Reference.findByIdAndDelete(id);

    const refs = await Reference.find();
    const grouped = { Frontend: [], Backend: [], DSA: [] };
    refs.forEach(ref => grouped[ref.category].push(ref));

    return res.json(grouped);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error"});
  }
};

export const updateReference = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    await Reference.findByIdAndUpdate(id, { name }, { new: true });

    const refs = await Reference.find();
    const grouped = { Frontend: [], Backend: [], DSA: [] };
    refs.forEach((ref) => {
      if (grouped[ref.category]) {
        grouped[ref.category].push(ref);
      }
    });

    return res.json(grouped);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};