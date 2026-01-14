import Attendance from "../models/attendanceModel.js";
import Absence from "../models/absenceModel.js";
import ReliefAssignment from "../models/reliefAssignmentModel.js";
import Announcement from "../models/announcementModel.js";

export const getTeacherDashboard = async (req, res) => {
  try {
    const teacherId = req.userId; // from JWT

    /* Attendance */
    const totalAttendance = await Attendance.countDocuments({
      teacher: teacherId,
    });

    const presentAttendance = await Attendance.countDocuments({
      teacher: teacherId,
      status: "Present",
    });

    const attendanceRate =
      totalAttendance === 0
        ? 0
        : Math.round((presentAttendance / totalAttendance) * 100);

    /* Leaves */
    const approvedLeaves = await Absence.countDocuments({
      teacher: teacherId,
      status: "Approved",
    });

    const totalLeaves = 40; // fixed or config based

    /* Relief Duties */
    const reliefDuties = await ReliefAssignment.countDocuments({
      reliefTeacher: teacherId,
      status: "completed",
    });

    /* Upcoming Relief */
    const upcomingRelief  = await ReliefAssignment.findOne({
      reliefTeacher: teacherId,
      status: "assigned",
    })
      .sort({ createdAt: -1 })
      .populate("attendance");

  
    /* Latest Announcement */
    const latestAnnouncement = await Announcement.findOne()
      .sort({ createdAt: -1 });

    res.status(200).json({
      attendanceRate,
      approvedLeaves: `${approvedLeaves} / ${totalLeaves}`,
      reliefDuties,
      upcomingRelief: upcomingRelief || null, 
      latestAnnouncement,
    });
  } catch (error) {
     console.error("Dashboard Error:", error);

     res.status(500).json({
       message: "Failed to load dashboard",
       error: error.message,
  });
}
};
