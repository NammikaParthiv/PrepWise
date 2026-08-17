import User from "../models/user.js";
import Resume from "../models/resume.js";
import Interview from "../models/interview.js";
import Reference from "../models/reference.js";

export const getReferences = async (req, res) => {
  try {
    const refs = await Reference.find().sort({ order: 1 });
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

export const addReferences = async (req, res) => {
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

// export const getUsers = async (req, res) => {
//   try {
//     const users = await User.find({ role: "user" });
//     return res.status(200).json({ msg: "Users rendered", users });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ msg: "Server Error" });
//   }
// };
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const search = req.query.search?.trim() || "";

    const skip = (page - 1) * limit;

    const query = {
      role: "user",
    };

    if (search) {
      query.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return res.status(200).json({
      msg: "Users rendered",
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalUsers,
        limit,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
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
    return res.status(500).json({ msg: "Server error" });
  }
};

export const updateReference = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    await Reference.findByIdAndUpdate(id, { name }, { returnDocument: 'after' });

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

export const reorderReferences = async (req, res) => {
  try {
    const { category, items } = req.body;

    if (!category || !Array.isArray(items)) {
      return res.status(400).json({ msg: "Category and items array are required" });
    }
    const bulkOperations = items.map((id, index) => ({
      updateOne: {
        filter: { _id: id, category },
        update: { $set: { order: index } },
      },
    }));

    if (bulkOperations.length > 0) {
      await Reference.bulkWrite(bulkOperations);
    }
    const refs = await Reference.find().sort({ order: 1 });
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