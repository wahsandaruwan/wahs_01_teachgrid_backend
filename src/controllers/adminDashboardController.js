import userModel from "../models/userModel.js";

export const getTotalTeachers = async (req, res) => {
  try {
    const totalTeachers = await userModel.countDocuments({
      role: "teacher"
    });

    res.status(200).json({
      success: true,
      totalTeachers
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
