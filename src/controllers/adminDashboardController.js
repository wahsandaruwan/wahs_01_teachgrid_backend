import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import leaveModel from "../models/leaveModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";

//view Total teachers, attendance summary, pending leaves, pending relief assignments
export const getTodayAttendanceSummary = async (req, res) => {
  try {
    const totalTeachers = await userModel.countDocuments({ role: "teacher" });
    const todayStr = new Date().toISOString().split("T")[0];
    const dayOfWeek = new Date().toLocaleDateString("en-US", { weekday: "long" });

    const [present, late, leave, unmarked, pendingLeaveCount, pendingReliefCount] =
      await Promise.all([
        attendanceModel.countDocuments({ date: todayStr, status: "present" }),
        attendanceModel.countDocuments({ date: todayStr, status: "late" }),
        attendanceModel.countDocuments({ date: todayStr, status: "leave" }),
        attendanceModel.countDocuments({ date: todayStr, status: "unmarked" }),
        leaveModel.countDocuments({ status: "Pending" }),
        ReliefAssignment.countDocuments({ status: "pending", dayOfWeek })
      ]);

    res.status(200).json({
      success: true,
      date: todayStr,
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

//Teacher Availability – Today or By Date
const getTeacherAvailability = async (date) => {
  const teachers = await userModel.find({ role: "teacher" }).select("name _id");
  const attendanceRecords = await attendanceModel
    .find({ date })
    .select("teacher status -_id");

  return teachers.map((teacher) => {
    const record = attendanceRecords.find(
      (att) => String(att.teacher) === String(teacher._id)
    );
    return {
      teacherName: teacher.name,
      status: record ? record.status : "unmarked"
    };
  });
};

export const getTodayTeacherAvailability = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const teachers = await getTeacherAvailability(todayStr);
    res.status(200).json({ success: true, date: todayStr, teachers });
  } catch (error) {
    console.error("Today availability error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getTeacherAvailabilityByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) return res.status(400).json({ success: false, message: "Date is required" });

    const teachers = await getTeacherAvailability(date);
    res.status(200).json({ success: true, date, teachers });
  } catch (error) {
    console.error("Availability by date error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
