import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import leaveModel from "../models/leaveModel.js";

// Get total teachers, today's attendance summary, and pending leave count
export const getTodayAttendanceSummary = async (req, res) => {
  try {
    // 1. Total teachers
    const totalTeachers = await userModel.countDocuments({ role: "teacher" });

    // 2. Today's date (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

    // 3. Attendance counts
    const presentCount = await attendanceModel.countDocuments({
      date: today,
      status: "present"
    });

    const lateCount = await attendanceModel.countDocuments({
      date: today,
      status: "late"
    });

    const leaveCount = await attendanceModel.countDocuments({
      date: today,
      status: "leave"
    });

    const unmarkedCount = await attendanceModel.countDocuments({
      date: today,
      status: "unmarked"
    });

    // 4. Pending leave requests count
    const pendingLeaveCount = await leaveModel.countDocuments({
      status: "Pending"
    });

    res.status(200).json({
      success: true,
      totalTeachers,
      today,
      attendanceSummary: {
        present: presentCount,
        late: lateCount,
        leave: leaveCount,
        unmarked: unmarkedCount
      },
      pendingLeaveCount
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
