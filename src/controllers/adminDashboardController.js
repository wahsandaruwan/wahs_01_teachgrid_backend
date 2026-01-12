import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import leaveModel from "../models/leaveModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";

export const getTodayAttendanceSummary = async (req, res) => {
  try {
    const totalTeachers = await userModel.countDocuments({ role: "teacher" });
    const today = new Date().toISOString().split("T")[0];

    const [present, late, leave, unmarked, pendingLeaveCount, pendingReliefCount] = await Promise.all([
      attendanceModel.countDocuments({ date: today, status: "present" }),
      attendanceModel.countDocuments({ date: today, status: "late" }),
      attendanceModel.countDocuments({ date: today, status: "leave" }),
      attendanceModel.countDocuments({ date: today, status: "unmarked" }),
      leaveModel.countDocuments({ status: "Pending" }),
      ReliefAssignment.countDocuments({ status: "pending" })
    ]);

    res.status(200).json({
      success: true,
      date: today,
      totalTeachers,
      attendanceSummary: { present, late, leave, unmarked },
      pendingLeaveCount,
      pendingReliefCount
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTodayTeacherAvailability = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const records = await attendanceModel.find({ date: today }).select("teacherName status -_id").sort({ teacherName: 1 });
    res.status(200).json({ success: true, date: today, teachers: records });
  } catch (error) {
    console.error("Today availability error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTeacherAvailabilityByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date is required (YYYY-MM-DD)" });

    const records = await attendanceModel.find({ date }).select("teacherName status -_id").sort({ teacherName: 1 });
    res.status(200).json({ success: true, date, teachers: records });
  } catch (error) {
    console.error("Availability by date error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
