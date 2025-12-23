import Timetable from "../models/timetable.js";
import userModel from "../models/userModel.js";

// Helper: ensure requester is admin
const requireAdmin = async (userId) => {
  const user = await userModel.findById(userId);
  if (!user || user.role !== "admin") {
    const err = new Error("Access denied. Admins only.");
    err.statusCode = 403;
    throw err;
  }
  return user;
};

// Create a single timetable slot (admin only)
export const createTimetableEntry = async (req, res) => {
  try {
    await requireAdmin(req.userId);

    const { teacher, grade, subject, dayOfWeek, period } = req.body;

    if (!teacher || !grade || !subject || !dayOfWeek || !period) {
      return res.status(400).json({
        success: false,
        message: "teacher, grade, subject, dayOfWeek and period are required"
      });
    }

    // Ensure teacher exists and is a teacher
    const teacherDoc = await userModel.findById(teacher);
    if (!teacherDoc || teacherDoc.role !== "teacher") {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const numericPeriod = Number(period);
    if (Number.isNaN(numericPeriod)) {
      return res.status(400).json({
        success: false,
        message: "period must be a number"
      });
    }

    const entry = await Timetable.create({
      teacher,
      grade,
      subject,
      dayOfWeek,
      period: numericPeriod
    });

    return res.status(201).json({
      success: true,
      message: "Timetable entry created",
      data: entry
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Timetable entry already exists for this teacher, day and period"
      });
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Get timetable entries with optional filters
// Admin: can see all / filtered
// Teacher: by default sees own timetable; can also use filters but restricted to own teacher id
export const getTimetableEntries = async (req, res) => {
  try {
    const requester = await userModel.findById(req.userId);
    if (!requester) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { teacher, grade, dayOfWeek } = req.query;
    const query = {};

    if (requester.role === "teacher") {
      // Teachers can only see their own timetable
      query.teacher = requester._id;
    } else if (teacher) {
      query.teacher = teacher;
    }

    if (grade) {
      query.grade = grade;
    }

    if (dayOfWeek) {
      query.dayOfWeek = dayOfWeek;
    }

    const entries = await Timetable.find(query)
      .populate({
        path: "teacher",
        select:
          "-password -verifyOtp -resetOtp -resetOtpExpireAt -verifyOtpExpireAt"
      })
      .sort({ dayOfWeek: 1, period: 1 });

    return res.status(200).json({
      success: true,
      message: "Timetable entries fetched",
      data: entries
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a timetable entry (admin only)
export const updateTimetableEntry = async (req, res) => {
  try {
    await requireAdmin(req.userId);

    const { id } = req.params;
    const { teacher, grade, subject, dayOfWeek, period } = req.body;

    const update = {};
    if (teacher) {
      const teacherDoc = await userModel.findById(teacher);
      if (!teacherDoc || teacherDoc.role !== "teacher") {
        return res.status(404).json({
          success: false,
          message: "Teacher not found"
        });
      }
      update.teacher = teacher;
    }
    if (grade) update.grade = grade;
    if (subject) update.subject = subject;
    if (dayOfWeek) update.dayOfWeek = dayOfWeek;
    if (period !== undefined) {
      const numericPeriod = Number(period);
      if (Number.isNaN(numericPeriod)) {
        return res.status(400).json({
          success: false,
          message: "period must be a number"
        });
      }
      update.period = numericPeriod;
    }

    const entry = await Timetable.findByIdAndUpdate(id, update, {
      new: true
    });

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Timetable entry updated",
      data: entry
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another timetable entry already exists with these details"
      });
    }

    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a timetable entry (admin only)
export const deleteTimetableEntry = async (req, res) => {
  try {
    await requireAdmin(req.userId);

    const { id } = req.params;
    const entry = await Timetable.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Timetable entry not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Timetable entry deleted"
    });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};


