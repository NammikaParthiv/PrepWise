import User from "../models/user.js";
import Resume from "../models/resume.js";
import Interview from "../models/interview.js";
import Reference from "../models/reference.js";
import Goal from "../models/goal.js";
import cloudinary from "../config/cloudinary.js";

export const getReferences = async (req, res) => {
  try {
    const refs = await Reference.find().sort({ order: 1 });
    const grouped = { Frontend: [], Backend: [], DSA: [], Practise: [] };

    // refs.forEach((ref) => {
    //   if (grouped[ref.category]) {
    //     grouped[ref.category].push(ref);
    //   }
    // });
    refs.forEach((ref) => {
      if (grouped[ref.category]) {
        grouped[ref.category].push(ref);
      } else {
        console.error(
          "Unknown reference category:",
          ref.category,
          "Reference ID:",
          ref._id
        );
      }
    });

    return res.json(grouped);
  } catch (error) {
    console.error("Get references error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};
//cloudinary storing
export const addReferences = async (req, res) => {
  try {
    const { category } = req.body;
    const file = req.file;
    if (!file) {
      return res.status(400).json({ msg: "File is required" });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "prepwise/references",
          resource_type: "image",
          timeout: 180000,//3min
        },
        (error, result) => {
          if (error) {
              console.error("CLOUDINARY ERROR MESSAGE:", error);
              reject(error);
          } else {
            resolve(result);
          }
        }
      );

      stream.end(file.buffer);
    });

    const newRef = new Reference({
      name: file.originalname.split(".")[0],
      photo_url: result.secure_url,
      cloudinary_public_id: result.public_id,
      type: file.mimetype === "application/pdf" ? "pdf" : "photo",
      date: new Date().toLocaleDateString(),
      category,
    });

    await newRef.save();

    const refs = await Reference.find();
    const grouped = { Frontend: [], Backend: [], DSA: [], Practise: [] };

    refs.forEach((ref) => grouped[ref.category].push(ref));

    return res.json(grouped);
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};
//render storing
// export const addReferences = async (req, res) => {
//   try {
//     const { category } = req.body;
//     const file = req.file;

//     if (!file) {
//       return res.status(400).json({ msg: "File is required" });
//     }

//     const newRef = new Reference({
//       name: file.originalname.split(".")[0],
//       photo_url: `/uploads/${file.filename}`,
//       type: file.mimetype === "application/pdf" ? "pdf" : "photo",
//       date: new Date().toLocaleDateString(),
//       category
//     });

//     await newRef.save();

//     const refs = await Reference.find();
//     const grouped = { Frontend: [], Backend: [], DSA: [],Practise:[] };
//     refs.forEach(ref => grouped[ref.category].push(ref));
//     return res.json(grouped);
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ msg: "Server error", error: error.message });
//   }
// };

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

//before Pagination

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

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      _id: id,
      role: "user",
    });

    if (!user) {
      return res.status(404).json({
        msg: "User not found",
      });
    }

    // Delete user's profile photo from Cloudinary
    if (user.profilePic_public_id) {
      try {
        await cloudinary.uploader.destroy(
          user.profilePic_public_id,
          {
            resource_type: "image",
          }
        );
      } catch (cloudinaryError) {
        console.error(
          "Cloudinary profile photo deletion failed:",
          cloudinaryError
        );
      }
    }

    await Promise.all([
      Resume.deleteMany({ user: id }),
      Interview.deleteMany({ user: id }),
      Goal.deleteMany({ user: id }),
    ]);

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      msg: "User and all associated data deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      msg: "Server Error",
      error: error.message,
    });
  }
};

export const deleteReference = async (req, res) => {
  try {
    const { id } = req.params;

    const reference = await Reference.findById(id);

    if (!reference) {
      return res.status(404).json({
        msg: "Reference not found",
      });
    }

    // Delete the actual file from Cloudinary
    if (reference.cloudinary_public_id) {
      await cloudinary.uploader.destroy(
        reference.cloudinary_public_id,
        {
          resource_type:
            reference.type === "pdf" ? "raw" : "image",
        }
      );
    }

    // Delete metadata from MongoDB
    await Reference.findByIdAndDelete(id);

    const refs = await Reference.find().sort({ order: 1 });

    const categories = [
      "Frontend",
      "Backend",
      "DSA",
      "Practise",
    ];

    const bulkOperations = [];

    for (const category of categories) {
      const categoryRefs = refs.filter(
        (ref) => ref.category === category
      );

      categoryRefs.forEach((ref, index) => {
        bulkOperations.push({
          updateOne: {
            filter: { _id: ref._id },
            update: { $set: { order: index } },
          },
        });
      });
    }

    if (bulkOperations.length > 0) {
      await Reference.bulkWrite(bulkOperations);
    }

    const updatedRefs = await Reference.find().sort({ order: 1 });

    const grouped = {
      Frontend: [],
      Backend: [],
      DSA: [],
      Practise: [],
    };

    updatedRefs.forEach((ref) => {
      if (grouped[ref.category]) {
        grouped[ref.category].push(ref);
      }
    });

    return res.json(grouped);
  } catch (error) {
    console.error("Delete reference error:", error);

    return res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
  }
};

export const updateReference = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category } = req.body;

    await Reference.findByIdAndUpdate(id, { name }, { returnDocument: 'after' });

    const refs = await Reference.find();
    const grouped = { Frontend: [], Backend: [], DSA: [], Practise: [] };
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
    const grouped = { Frontend: [], Backend: [], DSA: [], Practise: [] };
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