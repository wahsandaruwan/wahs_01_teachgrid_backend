import userModel from "../models/userModel.js";
import attendanceModel from "../models/attendanceModel.js";
import Absence from "../models/absenceModel.js"; 
import PDFDocument from 'pdfkit';
import { stringify } from 'csv-stringify/sync';

// 1. Get all users who are teachers
export const getTeachers = async (req, res) => {
    try {
        const teachers = await userModel.find({ role: 'teacher' }).select('name email _id');
        res.json(teachers);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Initialize attendance for a specific date
export const initAttendance = async (req, res) => {
    try {
        const { date } = req.body; 
        if (!date) return res.status(400).json({ message: "Date is required" });

        // 1. Find teachers
        const teachers = await userModel.find({ role: 'teacher' });

        if (teachers.length === 0) {
            return res.status(200).json({ 
                success: true, 
                message: "No teachers found to initialize." 
            });
        }

        const operations = teachers.map(t => ({
            updateOne: {
                // filter by 'teacher', not 'userId'
                filter: { teacher: t._id, date: date }, 
                update: {
                    $setOnInsert: {
                        teacher: t._id,
                        teacherName: t.name,
                        date: date,
                        status: 'unmarked',
                        subject: t.subject || "General"
                    }
                },
                upsert: true
            }
        }));

        // 2. Execute bulkWrite
        const result = await attendanceModel.bulkWrite(operations);
        
        
        res.json({ success: true, message: `Attendance initialized for ${date}` });

    } catch (error) {
        console.error("Error in initAttendance:", error); 
        res.status(500).json({ success: false, message: error.message });
    }
};
// 3. Get attendance for a specific date
export const getAttendanceByDate = async (req, res) => {
    try {
        const { date, q } = req.query;
        let query = { date };

        let records = await attendanceModel.find(query).lean();

        // Simple search filtering if 'q' is provided
        if (q) {
            records = records.filter(r => r.teacherName.toLowerCase().includes(q.toLowerCase()));
        }

        res.json(records);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update attendance status (Syncs with Absence model)
export const updateAttendance = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, checkIn, checkOut, subject } = req.body;

        const record = await attendanceModel.findByIdAndUpdate(
            id, 
            { status, checkIn, checkOut, subject }, 
            { new: true }
        );

        if (!record) return res.status(404).json({ message: "Record not found" });

        // SYNC LOGIC with your Absence model
        if (status === 'leave') {
            // Create or update Absence record
            await Absence.findOneAndUpdate(
                { teacher: record.teacher, date: new Date(record.date) },
                { reason: "Marked via Attendance System" },
                { upsert: true }
            );
        } else {
            // If status changed from 'leave' to 'present/late', remove from Absence collection
            await Absence.deleteOne({ teacher: record.teacher, date: new Date(record.date) });
        }

        res.json({ success: true, record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Export CSV
export const exportCSV = async (req, res) => {
    try {
        const { date } = req.query;
        const records = await attendanceModel.find({ date });

        const data = records.map(r => [r.teacherName, r.status, r.checkIn || '-', r.checkOut || '-']);
        const output = stringify(data, { header: true, columns: ['Teacher', 'Status', 'Check-In', 'Check-Out'] });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_${date}.csv`);
        res.send(output);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. Export PDF
export const exportPDF = async (req, res) => {
    try {
        const { date, teacherId } = req.query;
        
        let query = {};
        if (date) {
            query.date = { $regex: `^${date}` };
        }

        // If a teacherId is provided (Teacher Side), filter by that teacher
        // If not provided (Admin Side), it fetches all teachers for that date
        if (teacherId) {
            query.teacher = teacherId;
        }

        // Fetch records
        const records = await attendanceModel.find(query).sort({ date: 1 });

        // 2. CHECK IF DATA EXISTS
        if (!records || records.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: "No records found for the selected period." 
            });
        }

        // 3. GENERATE PDF
        const doc = new PDFDocument({ margin: 30, size: 'A4' });

        // Error handling for the PDF stream
        doc.on('error', (err) => {
            console.error("Stream Error:", err);
        });

        // Set Response Headers for File Download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=attendance_report_${date}.pdf`);

        // Pipe the doc to the response
        doc.pipe(res);

        // --- PDF LAYOUT ---

        // Header
        doc.fontSize(22).fillColor('#1d4ed8').text(`Attendance Report`, { align: 'center' });
        doc.fontSize(12).fillColor('#4b5563').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
        doc.fontSize(14).fillColor('#000000').text(`Period: ${date}`, { align: 'center' });
        doc.moveDown(2);

        // Table Header
        doc.fontSize(10).font('Helvetica-Bold').fillColor('#374151');
        const tableTop = doc.y;
        doc.text('Date', 30, tableTop);
        doc.text('Teacher Name', 110, tableTop);
        doc.text('Status', 280, tableTop);
        doc.text('Check In/Out', 400, tableTop);
        
        doc.moveTo(30, tableTop + 15).lineTo(560, tableTop + 15).strokeColor('#e5e7eb').stroke();
        doc.moveDown(1);

        // Records List
        doc.font('Helvetica').fillColor('#1f2937');
        records.forEach((r, i) => {
            const currentY = doc.y;
            
            // Draw a light gray line between rows
            if (i > 0) {
                doc.moveTo(30, currentY - 5).lineTo(560, currentY - 5).strokeColor('#f3f4f6').stroke();
            }

            const statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1);
            const timing = `${r.checkIn || '--:--'} - ${r.checkOut || '--:--'}`;

            doc.fontSize(9);
            doc.text(r.date, 30, currentY);
            doc.text(r.teacherName, 110, currentY, { width: 160 });
            doc.text(statusLabel, 280, currentY);
            doc.text(timing, 400, currentY);

            doc.moveDown(1.2);

            // Add new page if content exceeds height
            if (doc.y > 750) {
                doc.addPage();
            }
        });

        // Footer
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc.fontSize(8).fillColor('#9ca3af').text(
                `Page ${i + 1} of ${pageCount}`,
                30,
                doc.page.height - 50,
                { align: 'center' }
            );
        }

        // Finalize
        doc.end();

    } catch (error) {
        console.error("PDF Export Error:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Internal Server Error during PDF generation" });
        }
    }
};

// 7.0Get attendance history for the logged-in teacher
export const getMyAttendance = async (req, res) => {
    try {
        // req.userId is set by your userAuth middleware
        const teacherId = req.userId; 

        if (!teacherId) {
            return res.status(401).json({ success: false, message: "User ID not found in token" });
        }

        // Find all records where 'teacher' matches the logged-in user
        const records = await attendanceModel.find({ teacher: teacherId })
                                           .sort({ date: -1 }); // Newest first

        res.json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};