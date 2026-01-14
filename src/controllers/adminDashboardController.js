import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import leaveModel from "../models/leaveModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";

// Today Summary
export const getTodayAttendanceSummary = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];

    const activeTeachers = await userModel.find({ role: "teacher" }).select("_id");
    const activeTeacherIds = activeTeachers.map(t => t._id);

    const [presentCount, lateCount, leave, unmarked] = await Promise.all([
      attendanceModel.countDocuments({ date: todayStr, status: "present", teacher: { $in: activeTeacherIds } }),
      attendanceModel.countDocuments({ date: todayStr, status: "late", teacher: { $in: activeTeacherIds } }),
      attendanceModel.countDocuments({ date: todayStr, status: "leave", teacher: { $in: activeTeacherIds } }),
      attendanceModel.countDocuments({ date: todayStr, status: "unmarked", teacher: { $in: activeTeacherIds } })
    ]);

    const presentToday = presentCount + lateCount;

    const pendingLeaveCount = await leaveModel.countDocuments({ status: "Pending", teacher: { $in: activeTeacherIds } });

    const pendingReliefs = await ReliefAssignment.find({ status: "pending" }).populate({ path: "attendance", match: { date: todayStr }, select: "_id date" });
    const todayPendingReliefCount = pendingReliefs.filter(r => r.attendance !== null).length;

    res.status(200).json({
      success: true,
      date: todayStr,
      totalTeachers: activeTeacherIds.length,
      attendanceSummary: { present: presentToday, leave, unmarked },
      pendingLeaveCount,
      pendingReliefCount: todayPendingReliefCount
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Today Teacher Availability
export const getTodayTeacherAvailability = async (req, res) => {
  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const teachers = await userModel.find({ role: "teacher" }).select("name _id");
    const activeTeacherIds = teachers.map(t => t._id);

    const attendanceRecords = await attendanceModel.find({ date: todayStr, teacher: { $in: activeTeacherIds } }).select("teacher status -_id");

    const availability = teachers.map(teacher => {
      const record = attendanceRecords.find(att => String(att.teacher) === String(teacher._id));
      return { teacherName: teacher.name, status: record ? record.status : "unmarked" };
    });

    res.status(200).json({ success: true, date: todayStr, teachers: availability });
  } catch (error) {
    console.error("Today availability error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
