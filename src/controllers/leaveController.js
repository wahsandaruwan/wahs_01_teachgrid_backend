import leaveModel from "../models/leaveModel.js";

export const applyLeave = async (req, res) => {
    try {
        
        const userId = req.userId;

        const { leaveType, startDate, endDate, reason } = req.body;
        
        if (!leaveType || !startDate || !endDate || !reason) {
            return res.json({ success: false, message: "All fields are required" });
        }

        //  Calculating days
        const start = new Date(startDate);
        const end = new Date(endDate);
        const totalDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

        //  Processing Files
        const documentFiles = req.files.map(file => ({
            fileName: file.originalname,
            filePath: file.path
        }));

        // Saving to DB
        const newLeave = new leaveModel({
            teacherId: userId,
            leaveType,
            startDate,
            endDate,
            reason,
            totalDays,
            documents: documentFiles
        });

        await newLeave.save();
        res.json({ success: true, message: "Leave applied successfully!" });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const getMyLeaves = async (req, res) => {
    try {
        const teacherIdFromToken = req.userId; 

        if (!teacherIdFromToken) {
            return res.json({ success: false, message: "Teacher ID not found" });
        }

        const leaves = await leaveModel.find({ teacherId: teacherIdFromToken }).sort({ appliedAt: -1 });

        res.json({ success: true, leaves });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
};